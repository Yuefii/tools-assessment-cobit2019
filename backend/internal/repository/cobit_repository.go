package repository

import (
	"github.com/upii/me-tools-cobit2019/backend/internal/model"
	"gorm.io/gorm"
)

type CobitRepository interface {
	// Domains
	GetAllDomains() ([]model.CobitDomain, error)
	GetDomainByID(id uint) (*model.CobitDomain, error)
	CreateDomain(domain *model.CobitDomain) error
	UpdateDomain(domain *model.CobitDomain) error
	DeleteDomain(id uint) error

	// Objectives
	GetAllObjectives() ([]model.CobitObjective, error)
	CreateObjective(objective *model.CobitObjective) error

	// Practices
	GetAllPractices() ([]model.CobitPractice, error)
	CreatePractice(practice *model.CobitPractice) error

	// Activities
	GetAllActivities() ([]model.CobitActivity, error)
	CreateActivity(activity *model.CobitActivity) error
}

type cobitRepository struct {
	db *gorm.DB
}

func NewCobitRepository(db *gorm.DB) CobitRepository {
	return &cobitRepository{db}
}

// --- Domain ---
func (r *cobitRepository) GetAllDomains() ([]model.CobitDomain, error) {
	var domains []model.CobitDomain
	// Preload nested structures for a complete view
	err := r.db.Preload("Objectives.Practices.Activities").Find(&domains).Error
	return domains, err
}

func (r *cobitRepository) GetDomainByID(id uint) (*model.CobitDomain, error) {
	var domain model.CobitDomain
	err := r.db.Preload("Objectives.Practices.Activities").First(&domain, id).Error
	return &domain, err
}

func (r *cobitRepository) CreateDomain(domain *model.CobitDomain) error {
	return r.db.Create(domain).Error
}

func (r *cobitRepository) UpdateDomain(domain *model.CobitDomain) error {
	return r.db.Save(domain).Error
}

func (r *cobitRepository) DeleteDomain(id uint) error {
	return r.db.Delete(&model.CobitDomain{}, id).Error
}

// --- Objective ---
func (r *cobitRepository) GetAllObjectives() ([]model.CobitObjective, error) {
	var objs []model.CobitObjective
	err := r.db.Preload("Domain").Find(&objs).Error
	return objs, err
}

func (r *cobitRepository) CreateObjective(objective *model.CobitObjective) error {
	return r.db.Create(objective).Error
}

// --- Practice ---
func (r *cobitRepository) GetAllPractices() ([]model.CobitPractice, error) {
	var pracs []model.CobitPractice
	err := r.db.Find(&pracs).Error
	return pracs, err
}

func (r *cobitRepository) CreatePractice(practice *model.CobitPractice) error {
	return r.db.Create(practice).Error
}

// --- Activity ---
func (r *cobitRepository) GetAllActivities() ([]model.CobitActivity, error) {
	var acts []model.CobitActivity
	err := r.db.Find(&acts).Error
	return acts, err
}

func (r *cobitRepository) CreateActivity(activity *model.CobitActivity) error {
	return r.db.Create(activity).Error
}
