const bearerAuth = { bearerAuth: [] };

const errorSchema = {
  type: "object",
  properties: {
    success: { type: "boolean", example: false },
    message: { type: "string" }
  }
};

const paginationProps = {
  total: { type: "integer" },
  page: { type: "integer" },
  limit: { type: "integer" }
};

const uuidParam = (name: string, description?: string) => ({
  name,
  in: "path",
  required: true,
  description: description ?? `${name} (UUID)`,
  schema: { type: "string", format: "uuid" }
});

// ─── Schemas ─────────────────────────────────────────────────────────────────

const schemas = {
  Error: errorSchema,

  // ── User ──────────────────────────────────────────────────────────────────
  UserOut: {
    type: "object",
    properties: {
      id: { type: "string", format: "uuid" },
      email: { type: "string", format: "email" },
      firstName: { type: "string" },
      lastName: { type: "string" },
      role: { type: "string", enum: ["admin", "user"] },
      status: {
        type: "string",
        enum: ["active", "inactive", "suspended", "pending"]
      },
      phoneNumber: { type: "string", nullable: true },
      address: { type: "string", nullable: true },
      country: { type: "string", nullable: true },
      createdAt: { type: "string", format: "date-time" },
      updatedAt: { type: "string", format: "date-time" }
    }
  },
  CreateUserRequest: {
    type: "object",
    required: ["email", "password", "firstName", "lastName"],
    properties: {
      email: { type: "string", format: "email" },
      password: { type: "string", minLength: 8 },
      firstName: { type: "string" },
      lastName: { type: "string" },
      role: { type: "string", enum: ["admin", "user"] },
      status: {
        type: "string",
        enum: ["active", "inactive", "suspended", "pending"]
      },
      phoneNumber: { type: "string" },
      address: { type: "string" },
      country: { type: "string" }
    }
  },
  UpdateUserRequest: {
    type: "object",
    properties: {
      email: { type: "string", format: "email" },
      firstName: { type: "string" },
      lastName: { type: "string" },
      role: { type: "string", enum: ["admin", "user"] },
      status: {
        type: "string",
        enum: ["active", "inactive", "suspended", "pending"]
      },
      phoneNumber: { type: "string" },
      address: { type: "string" },
      country: { type: "string" }
    }
  },

  // ── Owner ─────────────────────────────────────────────────────────────────
  OwnerOut: {
    type: "object",
    properties: {
      id: { type: "string", format: "uuid" },
      userId: { type: "string", format: "uuid" },
      displayName: { type: "string", nullable: true },
      taxId: { type: "string", nullable: true },
      status: { type: "string", enum: ["active", "inactive", "suspended"] },
      createdAt: { type: "string", format: "date-time" },
      updatedAt: { type: "string", format: "date-time" }
    }
  },
  CreateOwnerRequest: {
    type: "object",
    required: ["userId"],
    properties: {
      userId: { type: "string", format: "uuid" },
      displayName: { type: "string" },
      taxId: { type: "string" },
      status: { type: "string", enum: ["active", "inactive", "suspended"] }
    }
  },
  UpdateOwnerRequest: {
    type: "object",
    properties: {
      displayName: { type: "string" },
      taxId: { type: "string" },
      status: { type: "string", enum: ["active", "inactive", "suspended"] }
    }
  },

  // ── Company ───────────────────────────────────────────────────────────────
  CompanyOut: {
    type: "object",
    properties: {
      id: { type: "string", format: "uuid" },
      name: { type: "string" },
      registrationNumber: { type: "string" },
      vatNumber: { type: "string", nullable: true },
      status: { type: "string", enum: ["active", "inactive", "suspended"] },
      description: { type: "string", nullable: true },
      website: { type: "string", nullable: true },
      phone: { type: "string", nullable: true },
      email: { type: "string", nullable: true },
      address: { type: "string", nullable: true },
      city: { type: "string", nullable: true },
      country: { type: "string", nullable: true },
      currency: { type: "string", nullable: true },
      ownerId: { type: "string", format: "uuid" },
      createdAt: { type: "string", format: "date-time" },
      updatedAt: { type: "string", format: "date-time" }
    }
  },
  CreateCompanyRequest: {
    type: "object",
    required: ["name", "registrationNumber", "ownerId"],
    properties: {
      name: { type: "string" },
      registrationNumber: { type: "string" },
      vatNumber: { type: "string" },
      status: { type: "string", enum: ["active", "inactive", "suspended"] },
      description: { type: "string" },
      website: { type: "string" },
      phone: { type: "string" },
      email: { type: "string", format: "email" },
      address: { type: "string" },
      city: { type: "string" },
      country: { type: "string" },
      currency: { type: "string" },
      ownerId: { type: "string", format: "uuid" }
    }
  },
  UpdateCompanyRequest: {
    type: "object",
    properties: {
      name: { type: "string" },
      registrationNumber: { type: "string" },
      vatNumber: { type: "string" },
      status: { type: "string", enum: ["active", "inactive", "suspended"] },
      description: { type: "string" },
      website: { type: "string" },
      phone: { type: "string" },
      email: { type: "string", format: "email" },
      address: { type: "string" },
      city: { type: "string" },
      country: { type: "string" },
      currency: { type: "string" }
    }
  },

  // ── Employee ──────────────────────────────────────────────────────────────
  EmployeeOut: {
    type: "object",
    properties: {
      id: { type: "string", format: "uuid" },
      userId: { type: "string", format: "uuid" },
      employeeNumber: { type: "string" },
      position: { type: "string" },
      department: { type: "string" },
      status: {
        type: "string",
        enum: ["active", "inactive", "on_leave", "terminated"]
      },
      contractType: {
        type: "string",
        enum: ["full-time", "part-time", "contract", "intern", "freelance"]
      },
      salary: { type: "number", nullable: true },
      workingHoursPerWeek: { type: "integer", nullable: true },
      hireDate: { type: "string", format: "date" },
      terminationDate: { type: "string", format: "date", nullable: true },
      companyId: { type: "string", format: "uuid" },
      createdAt: { type: "string", format: "date-time" },
      updatedAt: { type: "string", format: "date-time" }
    }
  },
  CreateEmployeeRequest: {
    type: "object",
    required: [
      "userId",
      "employeeNumber",
      "position",
      "department",
      "hireDate",
      "companyId"
    ],
    properties: {
      userId: { type: "string", format: "uuid" },
      employeeNumber: { type: "string" },
      position: { type: "string" },
      department: { type: "string" },
      status: {
        type: "string",
        enum: ["active", "inactive", "on_leave", "terminated"]
      },
      contractType: {
        type: "string",
        enum: ["full-time", "part-time", "contract", "intern", "freelance"]
      },
      salary: { type: "number" },
      workingHoursPerWeek: { type: "integer" },
      hireDate: { type: "string", format: "date" },
      companyId: { type: "string", format: "uuid" }
    }
  },

  // ── Timelog ───────────────────────────────────────────────────────────────
  TimelogOut: {
    type: "object",
    properties: {
      id: { type: "string", format: "uuid" },
      employeeId: { type: "string", format: "uuid", nullable: true },
      employeeName: { type: "string", nullable: true },
      date: { type: "string", format: "date" },
      totalHours: { type: "number" },
      type: {
        type: "string",
        enum: ["standard", "overtime", "holiday", "sick", "other"]
      },
      status: {
        type: "string",
        enum: ["draft", "submitted", "approved", "rejected"]
      },
      description: { type: "string", nullable: true },
      notes: { type: "string", nullable: true },
      approved: { type: "boolean" },
      approvedBy: { type: "string", nullable: true },
      approvedAt: { type: "string", format: "date-time", nullable: true },
      rejectionReason: { type: "string", nullable: true },
      billable: { type: "boolean" },
      createdAt: { type: "string", format: "date-time" },
      updatedAt: { type: "string", format: "date-time" }
    }
  },
  CreateTimelogRequest: {
    type: "object",
    required: ["employeeId", "date", "totalHours"],
    properties: {
      employeeId: { type: "string", format: "uuid" },
      date: { type: "string", format: "date" },
      totalHours: { type: "number", minimum: 0, maximum: 24 },
      type: {
        type: "string",
        enum: ["standard", "overtime", "holiday", "sick", "other"]
      },
      description: { type: "string" },
      notes: { type: "string" }
    }
  },
  UpdateTimelogRequest: {
    type: "object",
    properties: {
      date: { type: "string", format: "date" },
      totalHours: { type: "number", minimum: 0, maximum: 24 },
      type: {
        type: "string",
        enum: ["standard", "overtime", "holiday", "sick", "other"]
      },
      status: {
        type: "string",
        enum: ["draft", "submitted", "approved", "rejected"]
      },
      description: { type: "string" },
      notes: { type: "string" }
    }
  },
  RejectTimelogRequest: {
    type: "object",
    required: ["rejectionReason"],
    properties: {
      rejectionReason: { type: "string", minLength: 1 }
    }
  },
  BulkSubmitRequest: {
    type: "object",
    required: ["timelogIds"],
    properties: {
      timelogIds: {
        type: "array",
        items: { type: "string", format: "uuid" },
        minItems: 1
      }
    }
  },
  BulkApproveRequest: {
    type: "object",
    required: ["employeeId", "weekStart", "weekEnd", "action"],
    properties: {
      employeeId: { type: "string", format: "uuid" },
      weekStart: { type: "string", format: "date" },
      weekEnd: { type: "string", format: "date" },
      action: { type: "string", enum: ["approved", "rejected"] },
      rejectionReason: {
        type: "string",
        description: "Required when action is rejected"
      }
    }
  },

  // ── Absence ───────────────────────────────────────────────────────────────
  AbsenceOut: {
    type: "object",
    properties: {
      id: { type: "string", format: "uuid" },
      employeeId: { type: "string", format: "uuid" },
      type: {
        type: "string",
        enum: [
          "vacation",
          "sick_leave",
          "personal",
          "unpaid",
          "maternity",
          "paternity",
          "bereavement",
          "study",
          "time_in_lieu"
        ]
      },
      status: {
        type: "string",
        enum: ["pending", "approved", "rejected", "cancelled"]
      },
      startDate: { type: "string", format: "date" },
      endDate: { type: "string", format: "date" },
      totalDays: { type: "integer" },
      totalHours: { type: "number", nullable: true },
      notes: { type: "string", nullable: true },
      reviewedBy: { type: "string", nullable: true },
      reviewedAt: { type: "string", format: "date-time", nullable: true },
      rejectionReason: { type: "string", nullable: true },
      createdAt: { type: "string", format: "date-time" },
      updatedAt: { type: "string", format: "date-time" }
    }
  },
  CreateAbsenceRequest: {
    type: "object",
    required: ["employeeId", "type", "startDate", "endDate", "totalDays"],
    properties: {
      employeeId: { type: "string", format: "uuid" },
      type: {
        type: "string",
        enum: [
          "vacation",
          "sick_leave",
          "personal",
          "unpaid",
          "maternity",
          "paternity",
          "bereavement",
          "study",
          "time_in_lieu"
        ]
      },
      startDate: { type: "string", format: "date" },
      endDate: { type: "string", format: "date" },
      totalDays: { type: "integer" },
      notes: { type: "string" }
    }
  },
  ReviewAbsenceRequest: {
    type: "object",
    required: ["status"],
    properties: {
      status: { type: "string", enum: ["approved", "rejected"] },
      rejectionReason: { type: "string" }
    }
  }
};

// ─── Route helpers ────────────────────────────────────────────────────────────

const paginatedListParams = [
  { name: "page", in: "query", schema: { type: "integer", default: 1 } },
  { name: "limit", in: "query", schema: { type: "integer", default: 50 } }
];

function listResponse(itemRef: string) {
  return {
    200: {
      description: "Success",
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              success: { type: "boolean", example: true },
              data: { type: "array", items: { $ref: itemRef } },
              ...paginationProps
            }
          }
        }
      }
    },
    401: { description: "Unauthenticated" },
    403: { description: "Forbidden" }
  };
}

function singleResponse(itemRef: string, status = 200) {
  return {
    [status]: {
      description: "Success",
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              success: { type: "boolean", example: true },
              data: { $ref: itemRef }
            }
          }
        }
      }
    },
    401: { description: "Unauthenticated" },
    403: { description: "Forbidden" },
    404: { description: "Not found" }
  };
}

// ─── Spec ─────────────────────────────────────────────────────────────────────

export const swaggerSpec = {
  openapi: "3.0.0",
  info: {
    title: "Open ERP — API Service",
    version: "1.0.0",
    description:
      "Main REST API for Open ERP. All routes require a **Bearer token** issued by the Auth Service (`POST /login`). Admin-only routes are noted in their descriptions."
  },
  servers: [{ url: "http://localhost:5000", description: "Local development" }],
  security: [bearerAuth],
  components: {
    securitySchemes: {
      bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" }
    },
    schemas
  },
  tags: [
    { name: "Users", description: "User management — admin only" },
    { name: "Owners", description: "Owner management" },
    { name: "Companies", description: "Company management" },
    { name: "Employees", description: "Employee management" },
    { name: "Timelogs", description: "Timelog tracking and approval" },
    { name: "Absences", description: "Absence management and approval" }
  ],
  paths: {
    // ── Users ────────────────────────────────────────────────────────────────
    "/v1/users": {
      get: {
        summary: "List users",
        tags: ["Users"],
        parameters: [
          ...paginatedListParams,
          { name: "search", in: "query", schema: { type: "string" } },
          {
            name: "role",
            in: "query",
            schema: { type: "string", enum: ["admin", "user"] }
          },
          { name: "status", in: "query", schema: { type: "string" } }
        ],
        responses: listResponse("#/components/schemas/UserOut")
      },
      post: {
        summary: "Create user",
        tags: ["Users"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreateUserRequest" }
            }
          }
        },
        responses: singleResponse("#/components/schemas/UserOut", 201)
      }
    },
    "/v1/users/{id}": {
      get: {
        summary: "Get user by ID",
        tags: ["Users"],
        parameters: [uuidParam("id")],
        responses: singleResponse("#/components/schemas/UserOut")
      },
      put: {
        summary: "Replace user",
        tags: ["Users"],
        parameters: [uuidParam("id")],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UpdateUserRequest" }
            }
          }
        },
        responses: singleResponse("#/components/schemas/UserOut")
      },
      patch: {
        summary: "Partially update user",
        tags: ["Users"],
        parameters: [uuidParam("id")],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UpdateUserRequest" }
            }
          }
        },
        responses: singleResponse("#/components/schemas/UserOut")
      },
      delete: {
        summary: "Delete user",
        tags: ["Users"],
        parameters: [uuidParam("id")],
        responses: {
          204: { description: "Deleted" },
          401: { description: "Unauthenticated" },
          403: { description: "Forbidden" },
          404: { description: "Not found" }
        }
      }
    },

    // ── Owners ───────────────────────────────────────────────────────────────
    "/v1/owners/me": {
      get: {
        summary: "Get my owner profile",
        tags: ["Owners"],
        responses: singleResponse("#/components/schemas/OwnerOut")
      }
    },
    "/v1/owners": {
      get: {
        summary: "List owners — admin only",
        tags: ["Owners"],
        responses: listResponse("#/components/schemas/OwnerOut")
      },
      post: {
        summary: "Create owner — admin only",
        tags: ["Owners"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreateOwnerRequest" }
            }
          }
        },
        responses: singleResponse("#/components/schemas/OwnerOut", 201)
      }
    },
    "/v1/owners/{id}": {
      get: {
        summary: "Get owner by ID — admin only",
        tags: ["Owners"],
        parameters: [uuidParam("id")],
        responses: singleResponse("#/components/schemas/OwnerOut")
      },
      put: {
        summary: "Update owner — admin only",
        tags: ["Owners"],
        parameters: [uuidParam("id")],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UpdateOwnerRequest" }
            }
          }
        },
        responses: singleResponse("#/components/schemas/OwnerOut")
      },
      delete: {
        summary: "Delete owner — admin only",
        tags: ["Owners"],
        parameters: [uuidParam("id")],
        responses: {
          204: { description: "Deleted" },
          401: { description: "Unauthenticated" },
          403: { description: "Forbidden" },
          404: { description: "Not found" }
        }
      }
    },

    // ── Companies ─────────────────────────────────────────────────────────────
    "/v1/companies/mine": {
      get: {
        summary: "Get companies accessible to the current user",
        tags: ["Companies"],
        responses: listResponse("#/components/schemas/CompanyOut")
      }
    },
    "/v1/companies": {
      get: {
        summary: "List company IDs+names — admin only (lightweight dropdown)",
        tags: ["Companies"],
        responses: {
          200: {
            description: "Success",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    data: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          id: { type: "string" },
                          name: { type: "string" }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    "/v1/companies/manage": {
      get: {
        summary:
          "List full company records (admin sees all; owners see their own)",
        tags: ["Companies"],
        parameters: [
          ...paginatedListParams,
          { name: "search", in: "query", schema: { type: "string" } },
          { name: "status", in: "query", schema: { type: "string" } }
        ],
        responses: listResponse("#/components/schemas/CompanyOut")
      },
      post: {
        summary: "Create company",
        tags: ["Companies"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreateCompanyRequest" }
            }
          }
        },
        responses: singleResponse("#/components/schemas/CompanyOut", 201)
      }
    },
    "/v1/companies/manage/{id}": {
      get: {
        summary: "Get company by ID",
        tags: ["Companies"],
        parameters: [uuidParam("id")],
        responses: singleResponse("#/components/schemas/CompanyOut")
      },
      put: {
        summary: "Update company",
        tags: ["Companies"],
        parameters: [uuidParam("id")],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UpdateCompanyRequest" }
            }
          }
        },
        responses: singleResponse("#/components/schemas/CompanyOut")
      }
    },

    // ── Employees ─────────────────────────────────────────────────────────────
    "/v1/employees/me": {
      get: {
        summary: "Get my employee profile",
        tags: ["Employees"],
        responses: singleResponse("#/components/schemas/EmployeeOut")
      }
    },
    "/v1/employees": {
      get: {
        summary: "List employees",
        tags: ["Employees"],
        parameters: [
          ...paginatedListParams,
          { name: "search", in: "query", schema: { type: "string" } },
          {
            name: "companyId",
            in: "query",
            schema: { type: "string", format: "uuid" }
          },
          { name: "status", in: "query", schema: { type: "string" } },
          { name: "department", in: "query", schema: { type: "string" } }
        ],
        responses: listResponse("#/components/schemas/EmployeeOut")
      },
      post: {
        summary: "Create employee — admin only",
        tags: ["Employees"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreateEmployeeRequest" }
            }
          }
        },
        responses: singleResponse("#/components/schemas/EmployeeOut", 201)
      }
    },
    "/v1/employees/by-company/{companyId}": {
      get: {
        summary: "List employees in a company",
        tags: ["Employees"],
        parameters: [uuidParam("companyId")],
        responses: listResponse("#/components/schemas/EmployeeOut")
      }
    },
    "/v1/employees/{id}": {
      get: {
        summary: "Get employee by ID",
        tags: ["Employees"],
        parameters: [uuidParam("id")],
        responses: singleResponse("#/components/schemas/EmployeeOut")
      },
      put: {
        summary: "Replace employee — admin only",
        tags: ["Employees"],
        parameters: [uuidParam("id")],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreateEmployeeRequest" }
            }
          }
        },
        responses: singleResponse("#/components/schemas/EmployeeOut")
      },
      patch: {
        summary: "Partially update employee — admin only",
        tags: ["Employees"],
        parameters: [uuidParam("id")],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreateEmployeeRequest" }
            }
          }
        },
        responses: singleResponse("#/components/schemas/EmployeeOut")
      },
      delete: {
        summary: "Delete employee — admin only",
        tags: ["Employees"],
        parameters: [uuidParam("id")],
        responses: {
          204: { description: "Deleted" },
          401: { description: "Unauthenticated" },
          403: { description: "Forbidden" },
          404: { description: "Not found" }
        }
      }
    },
    "/v1/employees/{id}/managers": {
      get: {
        summary: "Get employee managers",
        tags: ["Employees"],
        parameters: [uuidParam("id")],
        responses: listResponse("#/components/schemas/EmployeeOut")
      },
      post: {
        summary: "Assign managers — admin or hr",
        tags: ["Employees"],
        parameters: [uuidParam("id")],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  managerIds: {
                    type: "array",
                    items: { type: "string", format: "uuid" }
                  }
                }
              }
            }
          }
        },
        responses: singleResponse("#/components/schemas/EmployeeOut")
      }
    },
    "/v1/employees/{id}/managees": {
      get: {
        summary: "Get employee managees",
        tags: ["Employees"],
        parameters: [uuidParam("id")],
        responses: listResponse("#/components/schemas/EmployeeOut")
      },
      post: {
        summary: "Assign managees — admin or hr",
        tags: ["Employees"],
        parameters: [uuidParam("id")],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  manageeIds: {
                    type: "array",
                    items: { type: "string", format: "uuid" }
                  }
                }
              }
            }
          }
        },
        responses: singleResponse("#/components/schemas/EmployeeOut")
      }
    },

    // ── Timelogs ──────────────────────────────────────────────────────────────
    "/v1/timelogs": {
      get: {
        summary: "List timelogs",
        tags: ["Timelogs"],
        parameters: [
          ...paginatedListParams,
          {
            name: "employeeId",
            in: "query",
            schema: { type: "string", format: "uuid" }
          },
          {
            name: "startDate",
            in: "query",
            schema: { type: "string", format: "date" }
          },
          {
            name: "endDate",
            in: "query",
            schema: { type: "string", format: "date" }
          },
          {
            name: "status",
            in: "query",
            schema: {
              type: "string",
              enum: ["draft", "submitted", "approved", "rejected"]
            }
          },
          {
            name: "type",
            in: "query",
            schema: {
              type: "string",
              enum: ["standard", "overtime", "holiday", "sick", "other"]
            }
          }
        ],
        responses: listResponse("#/components/schemas/TimelogOut")
      },
      post: {
        summary: "Create timelog",
        tags: ["Timelogs"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreateTimelogRequest" }
            }
          }
        },
        responses: singleResponse("#/components/schemas/TimelogOut", 201)
      }
    },
    "/v1/timelogs/summary": {
      get: {
        summary: "Get timelog summary grouped by employee",
        tags: ["Timelogs"],
        parameters: [
          {
            name: "startDate",
            in: "query",
            required: true,
            schema: { type: "string", format: "date" }
          },
          {
            name: "endDate",
            in: "query",
            required: true,
            schema: { type: "string", format: "date" }
          },
          {
            name: "employeeId",
            in: "query",
            schema: { type: "string", format: "uuid" }
          }
        ],
        responses: {
          200: {
            description: "Summary data",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    data: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          employeeId: { type: "string" },
                          employeeName: { type: "string" },
                          totalHours: { type: "number" },
                          byType: { type: "object" },
                          byStatus: { type: "object" }
                        }
                      }
                    },
                    totals: { type: "object" }
                  }
                }
              }
            }
          }
        }
      }
    },
    "/v1/timelogs/weekly-approvals": {
      get: {
        summary: "List weekly timelog approval summaries",
        tags: ["Timelogs"],
        parameters: [
          {
            name: "weekStart",
            in: "query",
            required: true,
            schema: { type: "string", format: "date" }
          },
          {
            name: "weekEnd",
            in: "query",
            required: true,
            schema: { type: "string", format: "date" }
          }
        ],
        responses: {
          200: {
            description: "Weekly approval data per employee",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    data: { type: "array", items: { type: "object" } }
                  }
                }
              }
            }
          }
        }
      }
    },
    "/v1/timelogs/bulk/submit": {
      post: {
        summary: "Bulk submit timelogs",
        tags: ["Timelogs"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/BulkSubmitRequest" }
            }
          }
        },
        responses: {
          200: {
            description: "Timelogs submitted",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    updated: { type: "integer" }
                  }
                }
              }
            }
          }
        }
      }
    },
    "/v1/timelogs/bulk/approve": {
      post: {
        summary: "Bulk approve or reject a week of timelogs",
        tags: ["Timelogs"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/BulkApproveRequest" }
            }
          }
        },
        responses: {
          200: {
            description: "Timelogs updated",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    updated: { type: "integer" }
                  }
                }
              }
            }
          }
        }
      }
    },
    "/v1/timelogs/employee/{employeeId}": {
      get: {
        summary: "List timelogs for an employee",
        tags: ["Timelogs"],
        parameters: [
          uuidParam("employeeId"),
          ...paginatedListParams,
          {
            name: "startDate",
            in: "query",
            schema: { type: "string", format: "date" }
          },
          {
            name: "endDate",
            in: "query",
            schema: { type: "string", format: "date" }
          },
          { name: "status", in: "query", schema: { type: "string" } }
        ],
        responses: listResponse("#/components/schemas/TimelogOut")
      }
    },
    "/v1/timelogs/{id}": {
      get: {
        summary: "Get timelog by ID",
        tags: ["Timelogs"],
        parameters: [uuidParam("id")],
        responses: singleResponse("#/components/schemas/TimelogOut")
      },
      put: {
        summary: "Replace timelog",
        tags: ["Timelogs"],
        parameters: [uuidParam("id")],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UpdateTimelogRequest" }
            }
          }
        },
        responses: singleResponse("#/components/schemas/TimelogOut")
      },
      patch: {
        summary: "Partially update timelog",
        tags: ["Timelogs"],
        parameters: [uuidParam("id")],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UpdateTimelogRequest" }
            }
          }
        },
        responses: singleResponse("#/components/schemas/TimelogOut")
      },
      delete: {
        summary: "Delete timelog",
        tags: ["Timelogs"],
        parameters: [uuidParam("id")],
        responses: {
          204: { description: "Deleted" },
          404: { description: "Not found" }
        }
      }
    },
    "/v1/timelogs/{id}/submit": {
      post: {
        summary: "Submit a timelog for approval",
        tags: ["Timelogs"],
        parameters: [uuidParam("id")],
        responses: singleResponse("#/components/schemas/TimelogOut")
      }
    },
    "/v1/timelogs/{id}/approve": {
      post: {
        summary: "Approve a timelog — admin or manager",
        tags: ["Timelogs"],
        parameters: [uuidParam("id")],
        responses: singleResponse("#/components/schemas/TimelogOut")
      }
    },
    "/v1/timelogs/{id}/reject": {
      post: {
        summary: "Reject a timelog — admin or manager",
        tags: ["Timelogs"],
        parameters: [uuidParam("id")],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/RejectTimelogRequest" }
            }
          }
        },
        responses: singleResponse("#/components/schemas/TimelogOut")
      }
    },

    // ── Absences ──────────────────────────────────────────────────────────────
    "/v1/absences": {
      get: {
        summary: "List absences (admin sees all; users see their own)",
        tags: ["Absences"],
        parameters: [
          ...paginatedListParams,
          {
            name: "employeeId",
            in: "query",
            schema: { type: "string", format: "uuid" }
          },
          {
            name: "status",
            in: "query",
            schema: {
              type: "string",
              enum: ["pending", "approved", "rejected", "cancelled"]
            }
          },
          { name: "type", in: "query", schema: { type: "string" } },
          {
            name: "startDate",
            in: "query",
            schema: { type: "string", format: "date" }
          },
          {
            name: "endDate",
            in: "query",
            schema: { type: "string", format: "date" }
          }
        ],
        responses: listResponse("#/components/schemas/AbsenceOut")
      },
      post: {
        summary: "Create absence request",
        tags: ["Absences"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreateAbsenceRequest" }
            }
          }
        },
        responses: singleResponse("#/components/schemas/AbsenceOut", 201)
      }
    },
    "/v1/absences/employee/{employeeId}": {
      get: {
        summary: "List absences for a specific employee",
        tags: ["Absences"],
        parameters: [
          uuidParam("employeeId"),
          { name: "year", in: "query", schema: { type: "integer" } },
          { name: "status", in: "query", schema: { type: "string" } }
        ],
        responses: listResponse("#/components/schemas/AbsenceOut")
      }
    },
    "/v1/absences/employee/{employeeId}/balance": {
      get: {
        summary: "Get vacation balance for an employee",
        tags: ["Absences"],
        parameters: [uuidParam("employeeId")],
        responses: {
          200: {
            description: "Vacation balance",
            content: { "application/json": { schema: { type: "object" } } }
          }
        }
      }
    },
    "/v1/absences/{id}": {
      get: {
        summary: "Get absence by ID",
        tags: ["Absences"],
        parameters: [uuidParam("id")],
        responses: singleResponse("#/components/schemas/AbsenceOut")
      },
      put: {
        summary: "Update pending absence",
        tags: ["Absences"],
        parameters: [uuidParam("id")],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreateAbsenceRequest" }
            }
          }
        },
        responses: singleResponse("#/components/schemas/AbsenceOut")
      },
      delete: {
        summary: "Cancel/delete absence",
        tags: ["Absences"],
        parameters: [uuidParam("id")],
        responses: {
          204: { description: "Deleted" },
          404: { description: "Not found" }
        }
      }
    },
    "/v1/absences/{id}/review": {
      post: {
        summary: "Approve or reject an absence",
        tags: ["Absences"],
        parameters: [uuidParam("id")],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ReviewAbsenceRequest" }
            }
          }
        },
        responses: singleResponse("#/components/schemas/AbsenceOut")
      }
    }
  }
};
