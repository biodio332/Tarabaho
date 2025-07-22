package com.example.mobile_tarabahoapp.model

data class Rating(
    val id: Long,
    val user: User?, // For reviewer's firstName and lastName
    val rating: Int, // 1-5 rating
    val comment: String? // Optional comment
)