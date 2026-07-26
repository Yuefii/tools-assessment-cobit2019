package handler

import (
	"strconv"

	"github.com/gofiber/fiber/v2"
	"github.com/upii/me-tools-cobit2019/backend/internal/service"
)

type AssessmentHandler struct {
	assessmentService service.AssessmentService
}

func NewAssessmentHandler(s service.AssessmentService) *AssessmentHandler {
	return &AssessmentHandler{s}
}

func (h *AssessmentHandler) CreateAssessment(c *fiber.Ctx) error {
	var input service.CreateAssessmentInput
	if err := c.BodyParser(&input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
	}

	assessorID := uint(c.Locals("user_id").(float64))

	assessment, err := h.assessmentService.CreateAssessment(input, assessorID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"message": "Assessment created successfully",
		"data":    assessment,
	})
}

func (h *AssessmentHandler) GetMyAssessments(c *fiber.Ctx) error {
	userID := uint(c.Locals("user_id").(float64))
	role := c.Locals("role").(string)

	assessments, err := h.assessmentService.GetMyAssessments(userID, role)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}

	return c.JSON(fiber.Map{"data": assessments})
}

func (h *AssessmentHandler) GetAssessmentDetails(c *fiber.Ctx) error {
	id, err := strconv.Atoi(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid ID"})
	}

	assessment, err := h.assessmentService.GetAssessmentDetails(uint(id))
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Assessment not found"})
	}

	return c.JSON(fiber.Map{"data": assessment})
}

func (h *AssessmentHandler) SubmitAnswer(c *fiber.Ctx) error {
	var input service.SubmitAnswerInput
	if err := c.BodyParser(&input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
	}

	auditeeID := uint(c.Locals("user_id").(float64))
	role := c.Locals("role").(string)

	err := h.assessmentService.SubmitAnswer(input, auditeeID, role)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
	}

	return c.JSON(fiber.Map{
		"message": "Answer submitted successfully",
	})
}

func (h *AssessmentHandler) GetAssessmentAnswers(c *fiber.Ctx) error {
	id, err := strconv.Atoi(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid ID"})
	}

	answers, err := h.assessmentService.GetAssessmentAnswers(uint(id))
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}

	return c.JSON(fiber.Map{"data": answers})
}

func (h *AssessmentHandler) UpdateAssessmentStatus(c *fiber.Ctx) error {
	id, err := strconv.Atoi(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid ID"})
	}
	var input struct {
		Status string `json:"status"`
	}
	if err := c.BodyParser(&input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
	}
	assessment, err := h.assessmentService.UpdateAssessmentStatus(uint(id), input.Status)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(fiber.Map{"data": assessment})
}
