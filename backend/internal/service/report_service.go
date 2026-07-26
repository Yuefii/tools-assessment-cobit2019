package service

import (
	"errors"
	"math"

	"github.com/upii/me-tools-cobit2019/backend/internal/repository"
)

type ReportService interface {
	GenerateAssessmentReport(assessmentID uint) (*ReportResponse, error)
}

type reportService struct {
	assessmentRepo repository.AssessmentRepository
}

func NewReportService(assessmentRepo repository.AssessmentRepository) ReportService {
	return &reportService{assessmentRepo}
}

type ObjectiveReportDetail struct {
	Code       string  `json:"code"`
	Name       string  `json:"name"`
	ScoreValue float64 `json:"score_value"` // 0-100%
	Level      float64 `json:"level"`       // 0-5
}

type ReportResponse struct {
	AssessmentID uint                    `json:"assessment_id"`
	Title        string                  `json:"title"`
	DomainCode   string                  `json:"domain_code"`
	DomainName   string                  `json:"domain_name"`
	TargetLevel  int                     `json:"target_level"`
	CurrentLevel float64                 `json:"current_level"` // As-Is
	Gap          float64                 `json:"gap"`
	ScorePercent float64                 `json:"score_percent"`
	Objectives   []ObjectiveReportDetail `json:"objectives"`
	Status       string                  `json:"status"`
	AssessorName string                  `json:"assessor_name"`
	AuditeeName  string                  `json:"auditee_name"`
	CreatedAt    string                  `json:"created_at"`
}

func (s *reportService) GenerateAssessmentReport(assessmentID uint) (*ReportResponse, error) {
	assessment, err := s.assessmentRepo.GetAssessmentByID(assessmentID)
	if err != nil {
		return nil, errors.New("assessment not found")
	}
	answers, err := s.assessmentRepo.GetAnswersByAssessment(assessmentID)
	if err != nil {
		return nil, errors.New("failed to fetch answers")
	}
	if len(answers) == 0 {
		return nil, errors.New("no answers submitted yet for this assessment")
	}

	// Score weights using midpoints per COBIT 2019 / ISO 33020
	scoreWeights := map[string]float64{
		"N": 7.5,
		"P": 32.5,
		"L": 67.5,
		"F": 92.5,
	}

	var totalScore float64
	for _, ans := range answers {
		totalScore += scoreWeights[ans.ScoreValue]
	}
	avgScorePercent := totalScore / float64(len(answers))

	currentLevel := scoreToCapabilityLevel(avgScorePercent)
	currentLevel = math.Round(currentLevel*100) / 100

	gap := float64(assessment.TargetLevel) - currentLevel
	if gap < 0 {
		gap = 0
	}

	// Collect domain codes/names from objectives (may span multiple domains)
	domainSet := map[string]string{}
	for _, ao := range assessment.Objectives {
		// We only have objective here; domain info is not preloaded at this level
		// Use objective code prefix as domain approximation
		code := ao.Objective.Code
		if len(code) >= 3 {
			dPrefix := code[:3]
			domainSet[dPrefix] = dPrefix
		}
	}
	domainCodes := ""
	for k := range domainSet {
		if domainCodes != "" {
			domainCodes += ", "
		}
		domainCodes += k
	}
	if domainCodes == "" {
		domainCodes = "N/A"
	}

	// Build per-objective report details
	objectiveDetails := []ObjectiveReportDetail{}
	for _, ao := range assessment.Objectives {
		obj := ao.Objective
		activityIDs := map[uint]bool{}
		for _, prac := range obj.Practices {
			for _, act := range prac.Activities {
				activityIDs[act.ID] = true
			}
		}
		if len(activityIDs) == 0 {
			continue
		}
		var objTotal float64
		var objCount int
		for _, ans := range answers {
			if activityIDs[ans.ActivityID] {
				objTotal += scoreWeights[ans.ScoreValue]
				objCount++
			}
		}
		var objScore float64
		if objCount > 0 {
			objScore = objTotal / float64(objCount)
		}
		objLevel := math.Round(scoreToCapabilityLevel(objScore)*100) / 100
		objectiveDetails = append(objectiveDetails, ObjectiveReportDetail{
			Code:       obj.Code,
			Name:       obj.Name,
			ScoreValue: math.Round(objScore*100) / 100,
			Level:      objLevel,
		})
	}

	if len(objectiveDetails) == 0 {
		objectiveDetails = []ObjectiveReportDetail{{
			Code:       "N/A",
			Name:       assessment.Title,
			ScoreValue: math.Round(avgScorePercent*100) / 100,
			Level:      currentLevel,
		}}
	}

	report := &ReportResponse{
		AssessmentID: assessment.ID,
		Title:        assessment.Title,
		DomainCode:   domainCodes,
		DomainName:   assessment.ScopeNote,
		TargetLevel:  assessment.TargetLevel,
		CurrentLevel: currentLevel,
		Gap:          math.Round(gap*100) / 100,
		ScorePercent: math.Round(avgScorePercent*100) / 100,
		Objectives:   objectiveDetails,
		Status:       assessment.Status,
		AssessorName: assessment.Assessor.Name,
		AuditeeName:  assessment.Auditee.Name,
		CreatedAt:    assessment.CreatedAt.Format("02 Jan 2006"),
	}
	return report, nil
}

func scoreToCapabilityLevel(pct float64) float64 {
	switch {
	case pct <= 15:
		return 0
	case pct <= 50:
		return 1.0 + ((pct - 15) / 35.0)
	case pct <= 70:
		return 2.0 + ((pct - 50) / 20.0)
	case pct <= 85:
		return 3.0 + ((pct - 70) / 15.0)
	case pct <= 95:
		return 4.0 + ((pct - 85) / 10.0)
	default:
		return 5.0
	}
}
