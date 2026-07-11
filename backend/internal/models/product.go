package models

type Product struct {
	ID          string   `json:"id,omitempty" bson:"_id,omitempty"`
	Name        string   `json:"name" bson:"name"`
	Price       float64  `json:"price" bson:"price"`
	Category    string   `json:"category" bson:"category"`
	Theme       string   `json:"theme" bson:"theme"`
	Badge       string   `json:"badge" bson:"badge"`
	Description string   `json:"description" bson:"description"`
	Specs       []string `json:"specs" bson:"specs"`
	Image       string   `json:"image" bson:"image"`
	Reviews     []Review `json:"reviews" bson:"reviews"`
	AverageRating float64 `json:"average_rating" bson:"average_rating"`
	Stock       int      `json:"stock" bson:"stock"`
}
