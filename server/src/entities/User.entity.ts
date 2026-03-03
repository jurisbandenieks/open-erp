// Single source of truth lives in shared/. Other server entities that import
// `./User.entity` continue to work without any changes.
export { User } from "@shared/entities/User.entity";
