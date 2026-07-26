package repository

import (
	"github.com/upii/me-tools-cobit2019/backend/internal/model"
	"gorm.io/gorm"
)

type AssessmentRepository interface {
	CreateAssessment(assessment *model.Assessment) error
	GetAllAssessments() ([]model.Assessment, error)
	GetAssessmentByID(id uint) (*model.Assessment, error)
	GetAssessmentsByAuditee(auditeeID uint) ([]model.Assessment, error)
	GetAssessmentsByAssessor(assessorID uint) ([]model.Assessment, error)
	
	SubmitAnswer(answer *model.Answer) error
	GetAnswersByAssessment(assessmentID uint) ([]model.Answer, error)
	UpdateAssessment(assessment *model.Assessment) error
	
	AddObjectiveToAssessment(ao *model.AssessmentObjective) error
	GetObjectivesByAssessment(assessmentID uint) ([]model.AssessmentObjective, error)
}

type assessmentRepository struct {
	db *gorm.DB
}

func NewAssessmentRepository(db *gorm.DB) AssessmentRepository {
	return &assessmentRepository{db}
}

func (r *assessmentRepository) CreateAssessment(assessment *model.Assessment) error {
	return r.db.Create(assessment).Error
}

func (r *assessmentRepository) GetAllAssessments() ([]model.Assessment, error) {
	var assessments []model.Assessment
	err := r.db.Preload("Assessor").Preload("Auditee").Preload("Objectives.Objective").Find(&assessments).Error
	return assessments, err
}

func (r *assessmentRepository) GetAssessmentByID(id uint) (*model.Assessment, error) {
	var assessment model.Assessment
	err := r.db.
		Preload("Assessor").
		Preload("Auditee").
		Preload("Objectives.Objective.Practices.Activities").
		First(&assessment, id).Error
	return &assessment, err
}

func (r *assessmentRepository) GetAssessmentsByAuditee(auditeeID uint) ([]model.Assessment, error) {
	var assessments []model.Assessment
	err := r.db.Preload("Assessor").Preload("Objectives.Objective").Where("auditee_id = ?", auditeeID).Find(&assessments).Error
	return assessments, err
}

func (r *assessmentRepository) GetAssessmentsByAssessor(assessorID uint) ([]model.Assessment, error) {
	var assessments []model.Assessment
	err := r.db.Preload("Auditee").Preload("Objectives.Objective").Where("assessor_id = ?", assessorID).Find(&assessments).Error
	return assessments, err
}

func (r *assessmentRepository) SubmitAnswer(answer *model.Answer) error {
	// Upsert based on AssessmentID and ActivityID
	var existing model.Answer
	err := r.db.Where("assessment_id = ? AND activity_id = ?", answer.AssessmentID, answer.ActivityID).First(&existing).Error
	
	if err == nil {
		// Update
		existing.ScoreValue = answer.ScoreValue
		existing.EvidenceURL = answer.EvidenceURL
		return r.db.Save(&existing).Error
	}
	
	// Create
	return r.db.Create(answer).Error
}

func (r *assessmentRepository) GetAnswersByAssessment(assessmentID uint) ([]model.Answer, error) {
	var answers []model.Answer
	err := r.db.Preload("Activity").Where("assessment_id = ?", assessmentID).Find(&answers).Error
	return answers, err
}

func (r *assessmentRepository) UpdateAssessment(assessment *model.Assessment) error {
	return r.db.Save(assessment).Error
}

func (r *assessmentRepository) AddObjectiveToAssessment(ao *model.AssessmentObjective) error {
	return r.db.Create(ao).Error
}

func (r *assessmentRepository) GetObjectivesByAssessment(assessmentID uint) ([]model.AssessmentObjective, error) {
	var aos []model.AssessmentObjective
	err := r.db.Preload("Objective.Practices.Activities").Where("assessment_id = ?", assessmentID).Find(&aos).Error
	return aos, err
}
