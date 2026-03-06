import { AppDataSource } from "../config/database";
import { Employee } from "../entities/Employee.entity";
import { AppError } from "../middleware/errorHandler";

const employeeRepo = () => AppDataSource.getRepository(Employee);

/**
 * Returns all employees belonging directly to a company.
 */
export const getEmployeesByCompany = async (
  companyId: string
): Promise<Employee[]> => {
  const employees = await employeeRepo()
    .createQueryBuilder("employee")
    .where("employee.companyId = :companyId", { companyId })
    .leftJoinAndSelect("employee.user", "user")
    .leftJoinAndSelect("employee.manages", "manages")
    .leftJoinAndSelect("manages.user", "managedUser")
    .orderBy("user.lastName", "ASC")
    .addOrderBy("user.firstName", "ASC")
    .getMany();

  if (employees.length === 0) {
    throw new AppError(`No employees found for company ${companyId}`, 404);
  }

  return employees;
};
