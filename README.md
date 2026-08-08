# 💊 Medicine Expiry & Inventory Tracker

A mobile-responsive React web application designed to track household medicine stock, monitor batch expiry dates, automatically alert for low stock, and export/import backup records in JSON format.

## ✨ Features
* **Stock Summary Cards:** Instant visibility into Total Stored Items, Expired Stock, Expiring Soon (< 60 Days), and Low Stock (< 10 units).
* **Auto-Parse Label OCR Support:** Upload packaging labels to extract medicine names, expiry dates, and lot numbers.
* **Manual Inventory Entry:** Full metadata tracking (Name, Expiry, Batch/Lot #, Dosage, Quantity, Category, Storage Location, Notes).
* **Search & Filter:** Instant search by name, batch, or location, filtered by category or expiry status.
* **JSON Backup & Restore:** Complete data offline persistence stored locally in browser `localStorage`, with one-click JSON backup export/import.

## 🚀 Quickstart & Setup

### Prerequisites
* [Node.js](https://nodejs.org/) (v16+)
* npm or yarn

### Installation
1. Clone the repository:
   ```bash
   git clone [https://github.com/YOUR_USERNAME/medicine-tracker.git](https://github.com/YOUR_USERNAME/medicine-tracker.git)
   cd medicine-tracker
