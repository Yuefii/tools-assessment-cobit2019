package model

import (
	"time"

	"gorm.io/gorm"
)

// CobitDomain (e.g., EDM, APO, BAI, DSS, MEA)
type CobitDomain struct {
	ID          uint           `gorm:"primaryKey" json:"id"`
	Code        string         `gorm:"unique;not null" json:"code"` // e.g. "DSS"
	Name        string         `gorm:"not null" json:"name"`        // e.g. "Deliver, Service and Support"
	Description string         `json:"description"`
	Objectives  []CobitObjective `gorm:"foreignKey:DomainID" json:"objectives,omitempty"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
}

// CobitObjective (e.g., DSS01 - Manage Operations)
type CobitObjective struct {
	ID          uint            `gorm:"primaryKey" json:"id"`
	DomainID    uint            `json:"domain_id"`
	Domain      CobitDomain     `gorm:"foreignKey:DomainID" json:"domain,omitempty"`
	Code        string          `gorm:"unique;not null" json:"code"` // e.g. "DSS01"
	Name        string         `gorm:"not null" json:"name"`
	Description string         `json:"description"`
	Practices   []CobitPractice  `gorm:"foreignKey:ObjectiveID" json:"practices,omitempty"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
}

// CobitPractice (e.g., DSS01.01 - Perform operational procedures)
type CobitPractice struct {
	ID          uint           `gorm:"primaryKey" json:"id"`
	ObjectiveID uint           `json:"objective_id"`
	Code        string         `gorm:"unique;not null" json:"code"` // e.g. "DSS01.01"
	Name        string         `gorm:"not null" json:"name"`
	Description string         `json:"description"`
	Activities  []CobitActivity  `gorm:"foreignKey:PracticeID" json:"activities,omitempty"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
}

// CobitActivity (Butir pertanyaan kuesioner aktual)
type CobitActivity struct {
	ID          uint           `gorm:"primaryKey" json:"id"`
	PracticeID  uint           `json:"practice_id"`
	Description string         `gorm:"type:text;not null" json:"description"` // The actual action/question
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
}
