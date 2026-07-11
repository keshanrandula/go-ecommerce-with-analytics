package models

type User struct {
	ID       string `json:"id,omitempty" bson:"_id,omitempty"`
	Name     string `json:"name" bson:"name"`
	Username string `json:"username" bson:"username"`
	Password string `json:"password" bson:"password"` // Hashed password
	Role     string `json:"role" bson:"role"`         // "admin" or "user"
}
