package com.example.mobile_tarabahoapp.api

import com.example.mobile_tarabahoapp.model.AuthResponse
import com.example.mobile_tarabahoapp.model.Booking
import com.example.mobile_tarabahoapp.model.BookingStatusResponse
import com.example.mobile_tarabahoapp.model.Category
import com.example.mobile_tarabahoapp.model.CategoryBookingRequest
import com.example.mobile_tarabahoapp.model.CategoryRequest
import com.example.mobile_tarabahoapp.model.CategoryRequestDTO
import com.example.mobile_tarabahoapp.model.Certificate
import com.example.mobile_tarabahoapp.model.CompleteBookingRequest
import com.example.mobile_tarabahoapp.model.LoginRequest
import com.example.mobile_tarabahoapp.model.ProfileUpdateRequest
import com.example.mobile_tarabahoapp.model.Rating
import com.example.mobile_tarabahoapp.model.RatingRequest
import com.example.mobile_tarabahoapp.model.RegisterRequest
import com.example.mobile_tarabahoapp.model.SendMessageRequest
import com.example.mobile_tarabahoapp.model.User
import com.example.mobile_tarabahoapp.model.Worker
import com.example.mobile_tarabahoapp.model.WorkerRegisterRequest
import com.example.mobile_tarabahoapp.model.WorkerUpdateRequest
import com.example.mobile_tarabahoapp.model.MessageDTO
import okhttp3.MultipartBody
import retrofit2.Response
import retrofit2.http.*

interface ApiService {
    @POST("api/user/token")
    suspend fun login(@Body loginRequest: LoginRequest): Response<AuthResponse>

    @POST("api/user/register")
    suspend fun register(@Body req: RegisterRequest): Response<User>

    @POST("api/user/logout")
    suspend fun logout(): Response<String>

    @PUT("api/user/update-profile")
    suspend fun updateProfile(@Body request: ProfileUpdateRequest): Response<User>

    @GET("api/user/me")
    suspend fun getCurrentUser(): Response<User>

    @Multipart
    @POST("api/user/upload-picture")
    suspend fun uploadProfilePicture(
        @Part file: MultipartBody.Part
    ): Response<User>

    @POST("api/worker/token")
    suspend fun loginWorker(@Body loginRequest: LoginRequest): Response<AuthResponse>

    @GET("api/worker/all")
    suspend fun getAllWorkers(): Response<List<Worker>>

    @GET("api/worker/category/{categoryName}/workers")
    suspend fun getWorkersByCategory(@Path("categoryName") categoryName: String): Response<List<Worker>>

    @GET("api/worker/{id}")
    suspend fun getWorkerById(@Path("id") id: String): Response<Worker>

    @PUT("api/worker/{id}")
    suspend fun updateWorkerProfile(@Path("id") id: Long, @Body request: WorkerUpdateRequest): Response<Worker>

    @GET("/api/worker/username/{username}")
    suspend fun getWorkerByUsername(@Path("username") username: String): Response<Worker>

    @POST("api/worker/login")
    suspend fun sessionLoginWorker(@Body worker: Worker): Response<Worker>

    @GET("api/booking/worker")
    suspend fun getWorkerBookings(): Response<List<Booking>>

    @POST("/api/booking/{bookingId}/accept")
    suspend fun acceptBooking(@Path("bookingId") bookingId: Long): Response<Booking>

    @POST("/api/booking/{bookingId}/reject")
    suspend fun rejectBooking(@Path("bookingId") bookingId: Long): Response<Booking>

    @POST("/api/booking/{bookingId}/complete")
    suspend fun completeBooking(@Path("bookingId") bookingId: Long, @Body request: CompleteBookingRequest): Response<Booking>

    @POST("/api/booking/{bookingId}/payment/confirm")
    suspend fun confirmPayment(@Path("bookingId") bookingId: Long, @Body request: CompleteBookingRequest): Response<Booking>

    @POST("/api/booking/{bookingId}/cancel")
    suspend fun cancelBooking(@Path("bookingId") bookingId: Long): Response<Booking>

    @POST("/api/booking/{bookingId}/start")
    suspend fun startBooking(@Path("bookingId") bookingId: Long): Response<Booking>

    @POST("/api/booking/{bookingId}/complete/accept")
    suspend fun acceptCompletion(@Path("bookingId") bookingId: Long): Response<Booking>

    @POST("/api/booking/category")
    suspend fun createCategoryBooking(@Body request: CategoryBookingRequest): Response<Booking>

    @GET("api/booking/{bookingId}/status")
    suspend fun getBookingStatus(@Path("bookingId") bookingId: Long): Response<BookingStatusResponse>

    @GET("api/booking/{bookingId}")
    suspend fun getBookingById(@Path("bookingId") bookingId: Long): Response<Booking>

    @POST("/api/booking/{bookingId}/complete/accept")
    suspend fun acceptBookingCompletion(@Path("bookingId") bookingId: Long): Response<Void> // Note: Duplicate endpoint; remove or fix

    @POST("/api/booking/rating")
    suspend fun submitRating(@Body request: RatingRequest): Response<String>

    @GET("/api/message/booking/{bookingId}")
    suspend fun getMessages(@Path("bookingId") bookingId: Long): Response<List<MessageDTO>>

    @POST("/api/message/send")
    suspend fun sendMessage(@Body request: SendMessageRequest): Response<MessageDTO>

    @POST("/api/worker/register")
    suspend fun registerWorker(@Body request: WorkerRegisterRequest): Response<Worker>

    @Multipart
    @POST("api/certificate/worker/{workerId}")
    suspend fun uploadCertificate(
        @Path("workerId") workerId: Long,
        @Part("courseName") courseName: String,
        @Part("certificateNumber") certificateNumber: String,
        @Part("issueDate") issueDate: String,
        @Part certificateFile: MultipartBody.Part?
    ): Response<Certificate>

    @POST("api/worker/{workerId}/request-category")
    suspend fun requestCategory(
        @Path("workerId") workerId: Long,
        @Body request: CategoryRequestDTO
    ): Response<CategoryRequest>

    @GET("api/categories")
    suspend fun getCategories(): Response<List<Category>>

    @GET("api/admin/category-requests/pending")
    suspend fun getPendingCategoryRequests(): Response<List<CategoryRequest>>

    @Multipart
    @POST("api/worker/{workerId}/upload-picture")
    suspend fun uploadProfilePicture(
        @Path("workerId") workerId: Long,
        @Part file: MultipartBody.Part
    ): Response<Worker>

    @GET("api/rating/worker/{workerId}")
    suspend fun getRatingsByWorkerId(@Path("workerId") workerId: Long): Response<List<Rating>>

    @GET("/api/booking/user")
    suspend fun getUserBookings(): Response<List<Booking>>

    @POST("/api/booking/{bookingId}/in-progress")
    suspend fun markBookingInProgress(@Path("bookingId") bookingId: Long): Response<Booking>
}