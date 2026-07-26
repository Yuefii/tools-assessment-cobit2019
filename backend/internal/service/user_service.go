package service

import (
	"errors"

	"github.com/upii/me-tools-cobit2019/backend/internal/model"
	"github.com/upii/me-tools-cobit2019/backend/internal/repository"
	"golang.org/x/crypto/bcrypt"
)

type UserService interface {
	GetAllUsers(page int, limit int, search string) ([]UserResponse, int64, error)
	GetUserByID(id uint) (*UserResponse, error)
	CreateUser(input RegisterInput) (*model.User, error)
	UpdateUser(id uint, input UpdateUserInput) (*UserResponse, error)
	DeleteUser(id uint) error
}

type userService struct {
	userRepo repository.UserRepository
}

func NewUserService(userRepo repository.UserRepository) UserService {
	return &userService{userRepo}
}

type UserResponse struct {
	ID    uint   `json:"id"`
	Name  string `json:"name"`
	Email string `json:"email"`
	Role  struct {
		ID   uint   `json:"id"`
		Name string `json:"name"`
	} `json:"role"`
}

type UpdateUserInput struct {
	Name  string `json:"name"`
	Email string `json:"email"`
	Role  string `json:"role"`
}

func toUserResponse(u *model.User) *UserResponse {
	resp := &UserResponse{
		ID:    u.ID,
		Name:  u.Name,
		Email: u.Email,
	}
	resp.Role.ID = u.Role.ID
	resp.Role.Name = u.Role.Name
	return resp
}

func (s *userService) GetAllUsers(page int, limit int, search string) ([]UserResponse, int64, error) {
	users, total, err := s.userRepo.GetAllUsers(page, limit, search)
	if err != nil {
		return nil, 0, err
	}
	var result []UserResponse
	for _, u := range users {
		u := u
		resp := toUserResponse(&u)
		result = append(result, *resp)
	}
	if result == nil {
		result = []UserResponse{}
	}
	return result, total, nil
}

func (s *userService) GetUserByID(id uint) (*UserResponse, error) {
	user, err := s.userRepo.GetUserByID(id)
	if err != nil {
		return nil, err
	}
	return toUserResponse(user), nil
}

func (s *userService) CreateUser(input RegisterInput) (*model.User, error) {
	_, err := s.userRepo.GetUserByEmail(input.Email)
	if err == nil {
		return nil, errors.New("email already registered")
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}

	roleName := input.Role
	if roleName == "" {
		roleName = "Auditee"
	}

	role, err := s.userRepo.GetRoleByName(roleName)
	if err != nil {
		return nil, errors.New("invalid role: " + roleName)
	}

	user := &model.User{
		Name:     input.Name,
		Email:    input.Email,
		Password: string(hashedPassword),
		RoleID:   role.ID,
	}

	if err := s.userRepo.CreateUser(user); err != nil {
		return nil, err
	}

	// Reload with role
	user.Role = *role
	return user, nil
}

func (s *userService) UpdateUser(id uint, input UpdateUserInput) (*UserResponse, error) {
	user, err := s.userRepo.GetUserByID(id)
	if err != nil {
		return nil, errors.New("user not found")
	}

	if input.Name != "" {
		user.Name = input.Name
	}
	if input.Email != "" {
		user.Email = input.Email
	}
	if input.Role != "" {
		role, err := s.userRepo.GetRoleByName(input.Role)
		if err != nil {
			return nil, errors.New("invalid role")
		}
		user.RoleID = role.ID
		user.Role = *role
	}

	if err := s.userRepo.UpdateUser(user); err != nil {
		return nil, err
	}

	return toUserResponse(user), nil
}

func (s *userService) DeleteUser(id uint) error {
	return s.userRepo.DeleteUser(id)
}
