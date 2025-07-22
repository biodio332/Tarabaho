package com.example.mobile_tarabahoapp.api.chat

import com.example.mobile_tarabahoapp.api.ApiService
import com.example.mobile_tarabahoapp.model.MessageDTO
import com.example.mobile_tarabahoapp.model.SendMessageRequest
import retrofit2.Response

class ChatRepository(private val api: ApiService) {

    suspend fun getMessages(bookingId: Long): List<MessageDTO> {
        return try {
            val response = api.getMessages(bookingId)
            if (response.isSuccessful) {
                response.body() ?: emptyList()
            } else {
                emptyList()
            }
        } catch (e: Exception) {
            emptyList()
        }
    }

    suspend fun sendMessage(request: SendMessageRequest): Response<MessageDTO> {
        return api.sendMessage(request)
    }
}