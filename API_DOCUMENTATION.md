# Pizzeria Webshop API Documentation

## 1. Topic and Purpose
- **Topic:** Pizzeria Webshop REST API.
- **Purpose:** This backend application provides a complete RESTful API for a Pizzeria. It allows guests to view the menu, registered users to manage their addresses and place orders, and administrators to manage the menu (pizzas, toppings) and update order statuses.

---

## 2. Data Model and Relationships

### Entities (Data Model)
- **User:** `id`, `name`, `email`, `password`, `is_admin`, `remember_token`.
- **Address:** `id`, `user_id`, `address`.
- **Pizza:** `id`, `name`, `description`, `price`, `image`.
- **Topping:** `id`, `name`.
- **Order:** `id`, `user_id`, `address_id`, `status` (pending, processing, delivered, cancelled).

#### Pivot (Join) Tables
- **order_pizza:** `order_id`, `pizza_id`, `quantity`, `purchased_price`.
- **pizza_topping:** `pizza_id`, `topping_id`.

### Relationships between tables
- **User (1) - (N) Address:** A user can have multiple addresses. An address belongs to exactly one user.
- **User (1) - (N) Order:** A user can place multiple orders. An order belongs to exactly one user.
- **Address (1) - (N) Order:** An order is delivered to one specific address.
- **Pizza (N) - (M) Order:** An order can contain multiple pizzas, and a pizza can be part of multiple orders. The pivot table (`order_pizza`) stores the `quantity` and the `purchased_price`.
- **Pizza (N) - (M) Topping:** A pizza can have multiple toppings, and a topping can be used on multiple pizzas.

---

## 3. Roles and Authorization Rules
The application uses **Laravel Sanctum** for token-based authentication.

- **Guest (Public):** No token required. Can browse pizzas and toppings, register a new account, and log in.
- **Regular User:** Requires a valid `Bearer Token` in the `Authorization` header. Can only view and manage their own profile, addresses, and orders. Cannot access other users' data.
- **Administrator:** Requires a valid `Bearer Token` and the user's `is_admin` flag must be `true`. Has all user privileges, plus the ability to create/edit/delete pizzas and toppings, and modify the status of any order in the system.

---

## 4. API Endpoints

*General Response Format:* All endpoints return a JSON object with `status` (boolean), `message` (string), and either `data` (object/array) or `errors` (object).

### 🟢 Public Endpoints
| Endpoint | Method | Required Parameters | Format | Description |
|---|---|---|---|---|
| `/api/register` | `POST` | `name` (string), `email` (string), `password` (string, min:6) | JSON | Registers a new user. |
| `/api/login` | `POST` | `email` (string), `password` (string) | JSON | Authenticates a user and returns a token. |
| `/api/pizzas` | `GET` | *None* | JSON | Lists all available pizzas with toppings. |
| `/api/pizzas/{id}` | `GET` | *None* | JSON | Retrieves a specific pizza by ID. |
| `/api/toppings` | `GET` | *None* | JSON | Lists all available toppings. |

### 🔵 User Endpoints (Requires Login / Bearer Token)
| Endpoint | Method | Required Parameters | Format | Description |
|---|---|---|---|---|
| `/api/user` | `GET` | *None* | JSON | Returns the currently authenticated user. |
| `/api/logout` | `POST` | *None* | JSON | Revokes the user's current token. |
| `/api/addresses` | `GET` | *None* | JSON | Lists addresses belonging to the user. |
| `/api/addresses` | `POST` | `address` (string) | JSON | Creates a new address for the user. |
| `/api/addresses/{id}` | `GET` | *None* | JSON | Gets a specific address of the user. |
| `/api/addresses/{id}` | `PUT` | `address` (string) | JSON | Updates the user's specific address. |
| `/api/addresses/{id}` | `DELETE`| *None* | JSON | Deletes the user's specific address. |
| `/api/orders` | `GET` | *None* | JSON | Lists all orders placed by the user. |
| `/api/orders` | `POST` | `address_id` (int), `pizzas` (array of objects with `id`, `quantity`) | JSON | Places a new order. |
| `/api/orders/{id}` | `GET` | *None* | JSON | Gets details of a specific order. |
| `/api/orders/{id}` | `DELETE`| *None* | JSON | Cancels/Deletes a specific order. |

### 🔴 Admin Endpoints (Requires Login & Admin Role)
| Endpoint | Method | Required Parameters | Format | Description |
|---|---|---|---|---|
| `/api/pizzas` | `POST` | `name`, `description`, `price`. Optional: `toppings` (array), `image` (file) | Form-Data | Creates a new pizza. |
| `/api/pizzas/{id}` | `PUT` | Optional: `name`, `description`, `price`, `toppings` (array), `image` (file) | Form-Data | Updates an existing pizza. |
| `/api/pizzas/{id}` | `DELETE`| *None* | JSON | Deletes a pizza. |
| `/api/toppings` | `POST` | `name` (string) | JSON | Creates a new topping. |
| `/api/toppings/{id}` | `PUT` | `name` (string) | JSON | Updates an existing topping. |
| `/api/toppings/{id}` | `DELETE`| *None* | JSON | Deletes a topping. |
| `/api/orders/{id}` | `PUT` | `status` (string: pending, processing, delivered, cancelled) | JSON | Updates order status. |

---

## 5. File Upload and Download

### 📤 File Upload
- **Endpoint:** Admin `POST /api/pizzas` or `PUT /api/pizzas/{id}`
- **Requirement:** Admin role.
- **Format:** `multipart/form-data`
- **Parameters:** `image` field.
- **Validation:** Must be an image file (`jpeg`, `png`, `jpg`, `gif`) and maximum 2MB (`2048 KB`).
- **Storage:** The file is stored physically in the `storage/app/public/pizzas` directory, and its public URL path is saved in the database.
- *Note for Postman:* To update an image using a PUT request, send a `POST` request to `/api/pizzas/{id}` but include `_method=PUT` in the form-data fields.

### 📥 File Download
- **Endpoint:** User/Admin `GET /api/pizzas/{id}/image`
- **Requirement:** Authenticated user (Bearer Token required).
- **Format:** Physical File Download.
- **Process:** Checks if the pizza and its image exist in the database, verifies the physical file on the server, and triggers a file download response instead of returning JSON data.

---

## 6. Installation and Execution Requirements

### Prerequisites
- PHP >= 8.2
- Composer
- MySQL or SQLite (configured in `.env`)

### Steps to Install and Run
1. **Clone the repository:**
   ```bash
   git clone <repository_url>
   cd Pizzeria
   ```
2. **Install dependencies:**
   ```bash
   composer install
   ```
3. **Environment Setup:**
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```
   *Make sure to configure your database settings in the `.env` file (e.g., `DB_CONNECTION`, `DB_DATABASE`).*
4. **Database Migration and Seeding:**
   ```bash
   php artisan migrate:fresh --seed
   ```
   *This command creates the database tables and populates them with initial dummy data (including an Admin and a Test User).*
5. **Storage Link:**
   ```bash
   php artisan storage:link
   ```
   *Required to make uploaded pizza images accessible from the public directory.*
6. **Start the Application:**
   ```bash
   php artisan serve
   ```
   *The API will be available at `http://localhost:8000`.*
