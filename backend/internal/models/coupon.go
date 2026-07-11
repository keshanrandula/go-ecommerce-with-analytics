package models

type Coupon struct {
	ID           string  `json:"id,omitempty" bson:"_id,omitempty"`
	Code         string  `json:"code" bson:"code"`
	DiscountType string  `json:"discount_type" bson:"discount_type"` // "percentage" or "fixed"
	Value        float64 `json:"value" bson:"value"`
}
