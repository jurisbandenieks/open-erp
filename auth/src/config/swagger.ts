const bearerAuth = { bearerAuth: [] };

const errorSchema = {
  type: "object",
  properties: {
    success: { type: "boolean", example: false },
    message: { type: "string", example: "Error message" }
  }
};

export const swaggerSpec = {
  openapi: "3.0.0",
  info: {
    title: "Open ERP — Auth Service",
    version: "1.0.0",
    description:
      "Authentication and session management service. Issues JWT access/refresh tokens and exposes a `/validate` endpoint consumed service-to-service by the API."
  },
  servers: [{ url: "http://localhost:5001", description: "Local development" }],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT"
      }
    },
    schemas: {
      Error: errorSchema,
      LoginRequest: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: {
            type: "string",
            format: "email",
            example: "admin@example.com"
          },
          password: { type: "string", example: "password123" }
        }
      },
      RegisterRequest: {
        type: "object",
        required: ["email", "password", "firstName", "lastName"],
        properties: {
          email: { type: "string", format: "email" },
          password: { type: "string", minLength: 8, example: "securePass1!" },
          firstName: { type: "string", example: "John" },
          lastName: { type: "string", example: "Doe" }
        }
      },
      UserOut: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          email: { type: "string" },
          firstName: { type: "string" },
          lastName: { type: "string" },
          role: { type: "string", enum: ["admin", "user"] },
          status: {
            type: "string",
            enum: ["active", "inactive", "suspended", "pending"]
          }
        }
      },
      AuthTokens: {
        type: "object",
        properties: {
          accessToken: { type: "string" },
          refreshToken: { type: "string" },
          user: { $ref: "#/components/schemas/UserOut" }
        }
      },
      AuthPayload: {
        type: "object",
        description: "Decoded JWT payload returned by /validate",
        properties: {
          userId: { type: "string", format: "uuid" },
          email: { type: "string" },
          roles: { type: "array", items: { type: "string" } }
        }
      },
      ValidateRequest: {
        type: "object",
        properties: {
          requiredRoles: {
            type: "array",
            items: { type: "string" },
            description:
              "If provided, returns 403 when the token holder lacks all of these roles",
            example: ["admin"]
          }
        }
      },
      RefreshRequest: {
        type: "object",
        required: ["refreshToken"],
        properties: {
          refreshToken: { type: "string" }
        }
      },
      LogoutRequest: {
        type: "object",
        required: ["userId"],
        properties: {
          userId: { type: "string", format: "uuid" }
        }
      }
    }
  },
  paths: {
    "/login": {
      post: {
        summary: "Login",
        description:
          "Authenticate with email and password. Returns access + refresh tokens.",
        tags: ["Auth"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/LoginRequest" }
            }
          }
        },
        responses: {
          200: {
            description: "Login successful",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    data: { $ref: "#/components/schemas/AuthTokens" }
                  }
                }
              }
            }
          },
          400: {
            description: "Validation error",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" }
              }
            }
          },
          401: {
            description: "Invalid credentials",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" }
              }
            }
          }
        }
      }
    },
    "/register": {
      post: {
        summary: "Register",
        description: "Create a new user account. Returns tokens on success.",
        tags: ["Auth"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/RegisterRequest" }
            }
          }
        },
        responses: {
          201: {
            description: "User registered successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    data: { $ref: "#/components/schemas/AuthTokens" }
                  }
                }
              }
            }
          },
          400: {
            description: "Validation error",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" }
              }
            }
          },
          409: {
            description: "Email already in use",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" }
              }
            }
          }
        }
      }
    },
    "/validate": {
      post: {
        summary: "Validate token",
        description:
          "Validates a Bearer token and returns the decoded payload. Optionally checks required roles. Called service-to-service by the API.",
        tags: ["Auth"],
        security: [bearerAuth],
        requestBody: {
          required: false,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ValidateRequest" }
            }
          }
        },
        responses: {
          200: {
            description: "Token is valid",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AuthPayload" }
              }
            }
          },
          401: {
            description: "Missing or invalid token",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" }
              }
            }
          },
          403: {
            description: "Insufficient role",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" }
              }
            }
          }
        }
      }
    },
    "/refresh": {
      post: {
        summary: "Refresh access token",
        description: "Exchange a valid refresh token for a new access token.",
        tags: ["Auth"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/RefreshRequest" }
            }
          }
        },
        responses: {
          200: {
            description: "New access token issued",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    data: {
                      type: "object",
                      properties: { accessToken: { type: "string" } }
                    }
                  }
                }
              }
            }
          },
          401: {
            description: "Invalid or expired refresh token",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" }
              }
            }
          }
        }
      }
    },
    "/logout": {
      post: {
        summary: "Logout",
        description:
          "Revoke the current session. Requires a Bearer token and the userId.",
        tags: ["Auth"],
        security: [bearerAuth],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/LogoutRequest" }
            }
          }
        },
        responses: {
          204: { description: "Logged out successfully" },
          400: {
            description: "userId is required",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" }
              }
            }
          },
          401: {
            description: "Missing or invalid token",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" }
              }
            }
          }
        }
      }
    }
  }
};
