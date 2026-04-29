
# iCons IMS User Manual

<details>
<summary><strong>Table of Contents</strong></summary>

- [iCons IMS User Manual](#icons-ims-user-manual)
  - [Overview](#overview)
  - [1. System Information](#1-system-information)
    - [1.1 System Description](#11-system-description)
    - [1.2 Data Organization](#12-data-organization)
    - [1.3 Loan Data Legend](#13-loan-data-legend)
    - [1.4 Stock Data Legend](#14-stock-data-legend)
    - [1.5 Authentication](#15-authentication)
  - [2. App Basics](#2-app-basics)
    - [2.1.1 Access](#211-access)
    - [2.2 App Tour](#22-app-tour)
      - [2.2.1 Navigation](#221-navigation)
      - [2.2.2 Dashboard](#222-dashboard)
      - [2.2.3 Data Pages](#223-data-pages)
      - [2.2.4 Settings](#224-settings)
  - [3. Common Operations](#3-common-operations)
    - [3.1 Inventory Management](#31-inventory-management)
      - [3.1.1 Logging a Rental](#311-logging-a-rental)
      - [3.1.2 Editing a Rental](#312-editing-a-rental)
      - [3.1.3 Logging a Returned Item](#313-logging-a-returned-item)
      - [3.1.4 Adding a New Item](#314-adding-a-new-item)
      - [3.1.6 Removing an Item](#316-removing-an-item)
    - [3.2 Data Migration](#32-data-migration)
      - [3.2.1 Importing Data](#321-importing-data)
      - [3.2.2 Exporting Data](#322-exporting-data)
    - [3.3 Customization](#33-customization)
      - [3.3.1 Adding and Editing Custom Equipment Types](#331-adding-and-editing-custom-equipment-types)
  - [4. Technical Information](#4-technical-information)
    - [4.1 Frameworks and Technologies](#41-frameworks-and-technologies)
    - [4.2 GitHub Repository](#42-github-repository)
  - [5. Closing Remarks](#5-closing-remarks)

</details>

## Overview
Welcome to the iCons IMS user manual.

This manual provides guidance on common operations, application navigation, account access and initial setup, as well as explanations of key features and workflows. 

If you are looking on a guide on a specific task/operation, please refer to it's corresponding section. If we have missed something, please contact us using the [Contact Us](https://icons-ims.vercel.app/contact) page once signed in.

## 1. System Information

### 1.1 System Description
The Inventory Management System (IMS) is a web-based tool for managing iCons inventory and handling equipment loans. It's fully cloud-based and leverages Microsoft OAuth with the Queen's University tenant for secure authentication. 

### 1.2 Data Organization
The IMS organizes data with two primary tables and several intermediate tables. It separates loan and stock data, and uses linked data fields to automatically sync updates across tables. 
- For instance, a loan of a single item will be removed from that item's stock count. 
  
### 1.3 Loan Data Legend
This table defines the fields used in the Loan Data structure.

| Field | Description |
|------|-------------|
| `Name` | Name of the item being loaned. |
| `Quantity` | Quantity of the item being loaned. |
| `Equipment Type` | Category of the item (e.g., stationary, electronic, etc.)|
| `Student Name` | Full name of the student renting equipment. |
| `Student Number` | 8-digit student ID number of the student renting equipment. |
| `Location` | Location associated with the loan record.  |
| `Status` | Current status of the loan (e.g., active, returned), derived from timestamps. |
| `Signee` | Name of the staff member who processed or signed off the loan. |
| `Time Loaned` | Timestamp when the item was loaned out. |
| `Time Returned` | Timestamp when the item was returned. |

### 1.4 Stock Data Legend
This table defines the fields used in the Stock Data structure.

| Field | Description |
|------|-------------|
| `Name` | Name of the inventory item. |
| `Equipment Type` | Category of the item (e.g., stationary, electronic, etc.)|
| `Total` | Total number of units owned for this item. |
| `Available` | Number of units currently available (not on loan). |
| `Status` | Current availability status of the item (e.g., in stock, low stock, out of stock), derived from stock values. |

### 1.5 Authentication
The IMS uses Microsoft OAuth with the Queen's university tenant `@queensu.ca` for authentication.

Admitted staff can login with their Queen's emails to access the app. 

Admins can manage users within the app, including adding new users, modifying roles, and removing users.

## 2. App Basics

### 2.1.1 Access

The application is accessed at the url [https://icons-ims.vercel.app](https://icons-ims.vercel.app/)

Once loaded, select the **Launch** button to start the app and login.
- Ensure you are using your Queen's email for login, ending in `@queensu.ca`

![iCons IMS Landing Page](./Media/Landing%20Page.png "iCons IMS Landing Page")
*Figure 2: App landing page*


Once signed in, you will have access to the system.

**A note on Role-Based Access**:
- If you are accessing the app as an iCon/Operator, you will have access to all functionality besides user management and clearing records. 
- As an Admin/Head Icon you will have access to all of the app's functionality. 

### 2.2 App Tour

#### 2.2.1 Navigation

A sidebar for navigation is featured on the left side of the screen; highlighted in Figure 2. The app's primary features are accessed here. 

Additionally, a top navigation bar is used to access the **Contact** page.

![Application Navbar](./Media/Nav_Bar_Highlight.png "Application Navbar")
*Figure 2: Highlighted navigation sidebar*

You can also press the shown arrow button to hide the sidebar and expand screen space for the selected view.

#### 2.2.2 Dashboard

The base view of the app is the [Dashboard](https://icons-ims.vercel.app/main/dashboard). On this page you can do all basic rental and inventory related operations.

![IMS Dashboard](./Media/Dashboard/Dashboard.png "iCons IMS Dashboard")
*Figure 3: Dashboard with table view of loan data*

To select between the `inventory` and `loans` modes of the dashboard, use the tab switcher in the table's header.

The dashboard has multiple views for functionality and user preference. They can be selected using the highlighted buttons below.

![Dashboard Multi View](./Media/Dashboard/Dashboard_View_Select_Highlight.png "Dashboard Multi-View Select.")
*Figure 4: Showcase of data multi-view feature*


1) **Table (Spreadsheet) View**  
This view provides a user-friendly version of a traditional spreadsheet interface. Edits are made directly within table cells.
2) **Card (Grid) View**  
This view presents data as individual cards for improved readability. Selecting a card opens a form that allows for easy editing of the entry.
3) **Analytic View**  
This view provides access to built-in analytics tools through chart-based visualizations.

#### 2.2.3 Data Pages

The two data pages are alternate ways of viewing and editing stored data. They are accessed using the two highlighted sidebar sections in the following figure.

![Data Pages Highlighted](./Media/Data_Pages_Highlight.png "Data pages highlighted in navbar.")
*Figure 4: Highlight of data pages in sidebar*

They function identically to the spreadsheet view of the dashboard, but without unrelated panels. Entry updates are performed in the same way as in the dashboard, within each respective view.

#### 2.2.4 Settings

The settings window can be accessed from the sidebar section highlighted in the following figure.

![Settings highlighted](./Media/Settings/Settings_Highlight.png "Settings Highlighted in navbar").
*Figure 5: Highlight of settings dialog in sidebar*

Once selected, the settings window will open.

In this window, operators can add or edit custom equipment types. Admins can add new users, change existing user roles, and remove users. 

![Settings Window](./Media/Settings/Settings_Window.png)
*Figure 5: Highlight of settings dialog in sidebar*

## 3. Common Operations 
The following section provides short tutorial GIFs of example operations through the IMS. 

### 3.1 Inventory Management
Inventory management can be executed in either data view. 

#### 3.1.1 Logging a Rental 
![Logging a Rental](./Media/Tutorial_GIFS/Logging_Rental_GIF.gif)

#### 3.1.2 Editing a Rental 
Rental data can be edited both inline in table view or form-based in grid view. 
![Editing a Rental](./Media/Tutorial_GIFS/Editing_Loan_GIF.gif)

#### 3.1.3 Logging a Returned Item
![Logging a Returned Item](./Media/Tutorial_GIFS/Completing_Loan_GIF.gif)

#### 3.1.4 Adding a New Item
![Adding a New Item](./Media/Tutorial_GIFS/Adding_Item_GIF.gif)

#### 3.1.6 Removing an Item 
This is an **Admin** operation. 
![Removing an Item](./Media/Tutorial_GIFS/Admin_Deleting_Item_GIF.gif)

### 3.2 Data Migration
#### 3.2.1 Importing Data
For data imports, select the `Import` button in the table view for the desired data, or use the sidebar. 

Imported files must be of  `CSV` format and have rows matching the systems'. 

#### 3.2.2 Exporting Data
All data can be exported as a CSV file with optional filtering. 
![Exporting Data](./Media/Tutorial_GIFS/Exporting_Data_GIF.gif)

### 3.3 Customization
#### 3.3.1 Adding and Editing Custom Equipment Types
![Adding and Editing Custom Equipment Types](./Media/Tutorial_GIFS/Equipment_Types_GIF.gif)

## 4. Technical Information 
### 4.1 Frameworks and Technologies 
The IMS uses the following frameworks:

**Frontend**
-  React JS
-  TailwindCSS
-   React Tanstack
-  shadCN
-  Framer Motion

**Backend**
-  Node JS
-  Supabase

### 4.2 GitHub Repository
All code and documentation can be found in the project [GitHub repository](). 

## 5. Closing Remarks

The IMS was developed by Group 887D for the Winter 2026 APSC 103 project.

For support or feedback, please reach out to the team through the application's [Contact Us](https://icons-ims.vercel.app/contact) page after signing in.

Alternatively, you can email the team directly at [Group887D@outlook.com](mailto:Group887D@outlook.com).

We hope this system provides a reliable and efficient solution for managing inventory and loans.

