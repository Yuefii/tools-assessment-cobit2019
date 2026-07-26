package service

import (
	"github.com/upii/me-tools-cobit2019/backend/internal/model"
	"github.com/upii/me-tools-cobit2019/backend/internal/repository"
)

type CobitService interface {
	GetAllDomains() ([]model.CobitDomain, error)
	GetDomainByID(id uint) (*model.CobitDomain, error)
	CreateDomain(domain *model.CobitDomain) error
	
	CreateObjective(objective *model.CobitObjective) error
	GetAllObjectives() ([]model.CobitObjective, error)
	CreatePractice(practice *model.CobitPractice) error
	CreateActivity(activity *model.CobitActivity) error
}

type cobitService struct {
	repo repository.CobitRepository
}

func NewCobitService(repo repository.CobitRepository) CobitService {
	return &cobitService{repo}
}

func (s *cobitService) GetAllDomains() ([]model.CobitDomain, error) {
	return s.repo.GetAllDomains()
}

func (s *cobitService) GetDomainByID(id uint) (*model.CobitDomain, error) {
	return s.repo.GetDomainByID(id)
}

func (s *cobitService) CreateDomain(domain *model.CobitDomain) error {
	return s.repo.CreateDomain(domain)
}

func (s *cobitService) CreateObjective(objective *model.CobitObjective) error {
	return s.repo.CreateObjective(objective)
}

func (s *cobitService) GetAllObjectives() ([]model.CobitObjective, error) {
	return s.repo.GetAllObjectives()
}

func (s *cobitService) CreatePractice(practice *model.CobitPractice) error {
	return s.repo.CreatePractice(practice)
}

func (s *cobitService) CreateActivity(activity *model.CobitActivity) error {
	return s.repo.CreateActivity(activity)
}
