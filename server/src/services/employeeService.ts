import { AppDataSource } from "../config/database";
import { Employee } from "../entities/Employee.entity";
import { AppError } from "../middleware/errorHandler";

const employeeRepo = () => AppDataSource.getRepository(Employee);

/**
 * Returns all distinct employees linked to a company via the manager→employee
 * many-to-many relationship (manager_employees join table).
 *
 * A manager belongs to a company → they manage employees → those employees
 * are considered "company employees through manager assignment".
 */
export const getEmployeesByCompanyViaManagers = async (
  companyId: string
): Promise<Employee[]> => {
  // Verify at least one manager exists for the company so we can give a
  // meaningful 404 instead of an empty array for a totally unknown companyId.
  const managerCount = await AppDataSource.createQueryBuilder()
    .select("1")
    .from("managers", "m")
    .where("m.companyId = :companyId", { companyId })
    .getCount();

  if (managerCount === 0) {
    throw new AppError(`No managers found for company ${companyId}`, 404);
  }

  return employeeRepo()
    .createQueryBuilder("employee")
    // Join through the owning side (Manager.employees) inverse relation
    .innerJoin("employee.managers", "manager")
    .where("manager.companyId = :companyId", { companyId })
    // Include the linked User for name / contact info
    .leftJoinAndSelect("employee.user", "user")
    .orderBy("user.lastName", "ASC")
    .addOrderBy("user.firstName", "ASC")
    .distinct(true)
    .getMany();
};
