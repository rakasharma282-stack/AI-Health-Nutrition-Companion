# Database Schema

## Models

### User
- id (Int, PK, autoincrement)
- email (String, unique)
- name (String?)
- passwordHash (String?) — null for OAuth users
- image (String?) — avatar URL
- role (Role enum: USER, PREMIUM, NUTRITIONIST, ADMIN, default USER)
- provider (String?) — google / credentials
- emailVerified (DateTime?)
- createdAt, updatedAt

### HealthProfile
- id (Int, PK)
- userId (Int, FK unique, relation to User)
- dateOfBirth (DateTime?)
- gender (String?)
- heightCm (Float?)
- weightKg (Float?)
- activityLevel (String?) — sedentary/light/moderate/active/very_active
- dietType (String?) — vegetarian/vegan/keto/mediterranean/etc
- allergies (String?) — comma-separated
- goal (String?) — lose/maintain/gain
- targetWeightKg (Float?)
- bmr (Float?) — computed
- dailyCalorieTarget (Float?) — computed
- proteinTarget (Float?), carbTarget (Float?), fatTarget (Float?)
- preferredCuisine (String?)
- createdAt, updatedAt

### FoodItem
- id (Int, PK)
- name (String)
- brand (String?)
- barcode (String?, unique)
- servingSize (Float)
- servingUnit (String) — g, ml, piece
- caloriesPerServing (Float)
- proteinPerServing (Float)
- carbsPerServing (Float)
- fatPerServing (Float)
- fiberPerServing (Float?)
- sugarPerServing (Float?)
- sodiumPerServing (Float?)
- cuisine (String?) — indian/international/etc
- dietTags (String?) — vegetarian/vegan/keto/jain/high-protein
- createdAt, updatedAt

### MealLog
- id (Int, PK)
- userId (Int, FK)
- foodItemId (Int, FK?) — null for photo-estimated
- photoUrl (String?)
- source (String) — search/photo
- mealType (String) — breakfast/lunch/dinner/snack
- quantity (Float) — number of servings
- date (DateTime)
- name (String) — food name snapshot
- calories, protein, carbs, fat, fiber, sugar, sodium (Float) — snapshot at log time
- createdAt

### WeightLog
- id, userId, weightKg (Float), date (DateTime), createdAt

### HydrationLog
- id, userId, amountMl (Float), date (DateTime), createdAt

### SleepLog
- id, userId, hours (Float), quality (Int 1-5), date (DateTime), createdAt

### MoodLog
- id, userId, mood (Int 1-5), note (String?), date (DateTime), createdAt

### ExerciseLog
- id, userId, type (String), durationMin (Float), caloriesBurned (Float), intensity (String), date (DateTime), createdAt

### MealPlan
- id, userId, planType (String: daily/weekly), startDate, endDate, content (Json), createdAt

### Recipe
- id, userId?, title, content (Json), ingredients (Json), nutrition (Json), servings, createdAt

### GroceryList
- id, userId, week (String), items (Json), checkedItems (Json), createdAt, updatedAt

### ChatThread
- id, userId, title, createdAt, updatedAt

### ChatMessage
- id, threadId (FK), role (String: user/assistant), content (String), createdAt

### Article
- id, category (String), title, summary, content (String), imageUrl, createdAt

## Relationships
- User 1:1 HealthProfile
- User 1:N MealLog, WeightLog, HydrationLog, SleepLog, MoodLog, ExerciseLog, MealPlan, Recipe, GroceryList, ChatThread
- ChatThread 1:N ChatMessage
- MealLog N:1 FoodItem (optional)
