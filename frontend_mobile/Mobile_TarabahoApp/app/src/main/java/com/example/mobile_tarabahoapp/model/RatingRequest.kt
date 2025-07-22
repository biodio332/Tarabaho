package com.example.mobile_tarabahoapp.model

data class RatingRequest(
    val bookingId: Long,
    val rating: Int,
    val comment: String
)
