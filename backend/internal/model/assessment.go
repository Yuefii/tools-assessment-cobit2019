package model

import (
	"time"

	"gorm.io/gorm"
)

// Assessment represents one audit project/session
type Assessment struct {
	ID          uint                  `gorm:"primaryKey" json:"id"`
	Title       string                `gorm:"not null" json:"title"`
	TargetLevel int                   `gorm:"default:3" json:"target_level"`
	Status      string                `gorm:"default:'draft'" json:"status"`
	AssessorID  uint                  `json:"assessor_id"`
	Assessor    User                  `gorm:"foreignKey:AssessorID" json:"assessor"`
	AuditeeID   uint                  `json:"auditee_id"`
	Auditee     User                  `gorm:"foreignKey:AuditeeID" json:"auditee"`
	ScopeNote   string                `json:"scope_note"`  // free-text scope description
	CreatedAt   time.Time             `json:"created_at"`
	UpdatedAt   time.Time             `json:"updated_at"`
	DeletedAt   gorm.DeletedAt        `gorm:"index" json:"-"`
	Objectives  []AssessmentObjective `gorm:"foreignKey:AssessmentID" json:"objectives,omitempty"`
}

// AssessmentObjective is the join table for multi-objective assessment scoping
type AssessmentObjective struct {
	ID            uint             `gorm:"primaryKey" json:"id"`
	AssessmentID  uint             `json:"assessment_id"`
	ObjectiveID   uint             `json:"objective_id"`
	Objective     CobitObjective   `gorm:"foreignKey:ObjectiveID" json:"objective"`
	CreatedAt     time.Time        `json:"created_at"`
}

// Answer holds the N-P-L-F response from Auditee
type Answer struct {
	ID           uint           `gorm:"primaryKey" json:"id"`
	AssessmentID uint           `json:"assessment_id"`
	ActivityID   uint           `json:"activity_id"`
	Activity     CobitActivity  `gorm:"foreignKey:ActivityID" json:"activity"`
	ScoreValue   string         `gorm:"type:varchar(2);not null" json:"score_value"` // N, P, L, F
	EvidenceURL  string         `json:"evidence_url"`
	CreatedAt    time.Time      `json:"created_at"`
	UpdatedAt    time.Time      `json:"updated_at"`
	DeletedAt    gorm.DeletedAt `gorm:"index" json:"-"`
}
