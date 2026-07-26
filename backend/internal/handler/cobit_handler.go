package handler

import (
	"strconv"

	"github.com/gofiber/fiber/v2"
	"github.com/upii/me-tools-cobit2019/backend/internal/model"
	"github.com/upii/me-tools-cobit2019/backend/internal/service"
)

type CobitHandler struct {
	cobitService service.CobitService
}

func NewCobitHandler(service service.CobitService) *CobitHandler {
	return &CobitHandler{service}
}

// --- Domain ---

func (h *CobitHandler) GetAllDomains(c *fiber.Ctx) error {
	domains, err := h.cobitService.GetAllDomains()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(fiber.Map{"data": domains})
}

func (h *CobitHandler) GetDomainByID(c *fiber.Ctx) error {
	id, err := strconv.Atoi(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid ID"})
	}

	domain, err := h.cobitService.GetDomainByID(uint(id))
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Domain not found"})
	}
	return c.JSON(fiber.Map{"data": domain})
}

func (h *CobitHandler) CreateDomain(c *fiber.Ctx) error {
	var domain model.CobitDomain
	if err := c.BodyParser(&domain); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
	}

	if err := h.cobitService.CreateDomain(&domain); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}
	return c.Status(fiber.StatusCreated).JSON(fiber.Map{"data": domain})
}

// --- Objective ---

func (h *CobitHandler) GetAllObjectives(c *fiber.Ctx) error {
	objs, err := h.cobitService.GetAllObjectives()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(fiber.Map{"data": objs})
}

func (h *CobitHandler) CreateObjective(c *fiber.Ctx) error {
	var obj model.CobitObjective
	if err := c.BodyParser(&obj); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
	}

	if err := h.cobitService.CreateObjective(&obj); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}
	return c.Status(fiber.StatusCreated).JSON(fiber.Map{"data": obj})
}

// --- Practice ---

func (h *CobitHandler) CreatePractice(c *fiber.Ctx) error {
	var prac model.CobitPractice
	if err := c.BodyParser(&prac); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
	}

	if err := h.cobitService.CreatePractice(&prac); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}
	return c.Status(fiber.StatusCreated).JSON(fiber.Map{"data": prac})
}

// --- Activity ---

func (h *CobitHandler) CreateActivity(c *fiber.Ctx) error {
	var act model.CobitActivity
	if err := c.BodyParser(&act); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
	}

	if err := h.cobitService.CreateActivity(&act); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}
	return c.Status(fiber.StatusCreated).JSON(fiber.Map{"data": act})
}
