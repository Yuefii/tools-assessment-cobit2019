package service

import (
	"errors"

	"github.com/upii/me-tools-cobit2019/backend/internal/model"
	"github.com/upii/me-tools-cobit2019/backend/internal/repository"
)

type AssessmentService interface {
	CreateAssessment(input CreateAssessmentInput, assessorID uint) (*model.Assessment, error)
	GetMyAssessments(userID uint, role string) ([]model.Assessment, error)
	GetAssessmentDetails(id uint) (*model.Assessment, error)
	
	SubmitAnswer(input SubmitAnswerInput, auditeeID uint, role string) error
	GetAssessmentAnswers(assessmentID uint) ([]model.Answer, error)
	UpdateAssessmentStatus(id uint, status string) (*model.Assessment, error)
}

type assessmentService struct {
	repo repository.AssessmentRepository
}

func NewAssessmentService(repo repository.AssessmentRepository) AssessmentService {
	return &assessmentService{repo}
}

type CreateAssessmentInput struct {
	Title        string `json:"title" validate:"required"`
	TargetLevel  int    `json:"target_level"`
	AuditeeID    uint   `json:"auditee_id" validate:"required"`
	ScopeNote    string `json:"scope_note"`
	ObjectiveIDs []uint `json:"objective_ids" validate:"required"` // array of objective IDs
}

type SubmitAnswerInput struct {
	AssessmentID uint   `json:"assessment_id" validate:"required"`
	ActivityID   uint   `json:"activity_id" validate:"required"`
	ScoreValue   string `json:"score_value" validate:"required"` // N, P, L, F
	EvidenceURL  string `json:"evidence_url"`
}

func (s *assessmentService) CreateAssessment(input CreateAssessmentInput, assessorID uint) (*model.Assessment, error) {
	if len(input.ObjectiveIDs) == 0 {
		return nil, errors.New("at least one objective must be selected")
	}
	assessment := &model.Assessment{
		Title:       input.Title,
		TargetLevel: input.TargetLevel,
		AssessorID:  assessorID,
		AuditeeID:   input.AuditeeID,
		ScopeNote:   input.ScopeNote,
		Status:      "active",
	}
	err := s.repo.CreateAssessment(assessment)
	if err != nil {
		return nil, err
	}
	// Add selected objectives
	for _, objID := range input.ObjectiveIDs {
		assessmentObj := &model.AssessmentObjective{
			AssessmentID: assessment.ID,
			ObjectiveID:  objID,
		}
		if err := s.repo.AddObjectiveToAssessment(assessmentObj); err != nil {
			return nil, err
		}
	}
	return s.repo.GetAssessmentByID(assessment.ID)
}

func (s *assessmentService) GetMyAssessments(userID uint, role string) ([]model.Assessment, error) {
	if role == "Admin" {
		return s.repo.GetAllAssessments()
	} else if role == "Assessor" {
		return s.repo.GetAssessmentsByAssessor(userID)
	} else if role == "Auditee" {
		return s.repo.GetAssessmentsByAuditee(userID)
	}
	return nil, errors.New("unauthorized role")
}

func (s *assessmentService) GetAssessmentDetails(id uint) (*model.Assessment, error) {
	return s.repo.GetAssessmentByID(id)
}

func (s *assessmentService) SubmitAnswer(input SubmitAnswerInput, auditeeID uint, role string) error {
	// First check if the assessment belongs to this auditee
	assessment, err := s.repo.GetAssessmentByID(input.AssessmentID)
	if err != nil {
		return errors.New("assessment not found")
	}

	if assessment.AuditeeID != auditeeID && role != "Admin" && role != "Assessor" {
		return errors.New("not authorized to submit answers for this assessment")
	}

	// Validate ScoreValue (N, P, L, F)
	validScores := map[string]bool{"N": true, "P": true, "L": true, "F": true}
	if !validScores[input.ScoreValue] {
		return errors.New("invalid score value, must be N, P, L, or F")
	}

	answer := &model.Answer{
		AssessmentID: input.AssessmentID,
		ActivityID:   input.ActivityID,
		ScoreValue:   input.ScoreValue,
		EvidenceURL:  input.EvidenceURL,
	}

	return s.repo.SubmitAnswer(answer)
}

func (s *assessmentService) GetAssessmentAnswers(assessmentID uint) ([]model.Answer, error) {
	return s.repo.GetAnswersByAssessment(assessmentID)
}

func (s *assessmentService) UpdateAssessmentStatus(id uint, status string) (*model.Assessment, error) {
	assessment, err := s.repo.GetAssessmentByID(id)
	if err != nil {
		return nil, errors.New("assessment not found")
	}
	validStatuses := map[string]bool{"draft": true, "active": true, "completed": true}
	if !validStatuses[status] {
		return nil, errors.New("invalid status")
	}
	assessment.Status = status
	err = s.repo.UpdateAssessment(assessment)
	return assessment, err
}
