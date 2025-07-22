package com.example.mobile_tarabahoapp.AuthRepository

import android.util.Log
import androidx.compose.runtime.mutableStateOf
import androidx.lifecycle.*
import com.example.mobile_tarabahoapp.api.RetrofitClient
import com.example.mobile_tarabahoapp.model.Certificate as AppCertificate
import com.example.mobile_tarabahoapp.model.Category
import com.example.mobile_tarabahoapp.model.CategoryBookingRequest
import com.example.mobile_tarabahoapp.model.CategoryRequestDTO
import com.example.mobile_tarabahoapp.model.Worker
import com.example.mobile_tarabahoapp.model.WorkerUpdateRequest
import kotlinx.coroutines.launch
import okhttp3.MultipartBody
import retrofit2.Response

class WorkerViewModel : ViewModel() {

    private val api = RetrofitClient.apiService

    private val _workers = MutableLiveData<List<Worker>>(emptyList())
    val workers: LiveData<List<Worker>> = _workers

    private val _selectedWorker = MutableLiveData<Worker?>()
    val selectedWorker: LiveData<Worker?> = _selectedWorker

    private val _updateSuccess = MutableLiveData<Boolean>()
    val updateSuccess: LiveData<Boolean> = _updateSuccess

    private val _certificateUploadSuccess = MutableLiveData<Boolean>()
    val certificateUploadSuccess: LiveData<Boolean> = _certificateUploadSuccess

    private val _profilePictureUploadSuccess = MutableLiveData<Boolean>()
    val profilePictureUploadSuccess: LiveData<Boolean> = _profilePictureUploadSuccess

    private val _categoryRequestSuccess = MutableLiveData<Boolean>()
    val categoryRequestSuccess: LiveData<Boolean> = _categoryRequestSuccess

    private val _categories = MutableLiveData<List<Category>>(emptyList())
    val categories: LiveData<List<Category>> = _categories

    private val _isLoading = mutableStateOf(false)
    val isLoading get() = _isLoading

    fun fetchWorkers() {
        viewModelScope.launch {
            _isLoading.value = true
            try {
                val response: Response<List<Worker>> = api.getAllWorkers()
                if (response.isSuccessful && response.body() != null) {
                    _workers.value = response.body()
                }
            } catch (e: Exception) {
                e.printStackTrace()
            } finally {
                _isLoading.value = false
            }
        }
    }

    fun fetchWorkerById(workerId: String) {
        viewModelScope.launch {
            Log.d("WorkerViewModel", "Calling API for worker ID: $workerId")
            try {
                val response = api.getWorkerById(workerId)
                if (response.isSuccessful) {
                    Log.d("WorkerViewModel", "Fetched worker: ${response.body()}")
                    _selectedWorker.value = response.body()
                } else {
                    Log.e("WorkerViewModel", "API failed: ${response.code()} ${response.message()}")
                }
            } catch (e: Exception) {
                Log.e("WorkerViewModel", "Exception: ${e.message}")
            }
        }
    }

    fun fetchWorkersByCategory(categoryName: String) {
        viewModelScope.launch {
            _isLoading.value = true
            try {
                val response = api.getWorkersByCategory(categoryName)
                if (response.isSuccessful && response.body() != null) {
                    _workers.value = response.body()
                }
            } catch (e: Exception) {
                e.printStackTrace()
            } finally {
                _isLoading.value = false
            }
        }
    }

    fun updateWorkerProfile(workerId: Long, request: WorkerUpdateRequest) {
        viewModelScope.launch {
            try {
                val response = api.updateWorkerProfile(workerId, request)
                _updateSuccess.postValue(response.isSuccessful)
            } catch (e: Exception) {
                Log.e("WorkerViewModel", "Update error: ${e.message}")
                _updateSuccess.postValue(false)
            }
        }
    }

    fun createChatBooking(
        request: CategoryBookingRequest,
        onResult: (Long) -> Unit
    ) {
        viewModelScope.launch {
            try {
                val response = RetrofitClient.apiService.createCategoryBooking(request)
                if (response.isSuccessful) {
                    val booking = response.body()
                    if (booking != null) {
                        onResult(booking.id)
                    }
                }
            } catch (e: Exception) {
                Log.e("WorkerViewModel", "Booking failed: ${e.message}")
            }
        }
    }

    fun uploadCertificate(workerId: Long, certificate: AppCertificate, file: MultipartBody.Part?) {
        viewModelScope.launch {
            try {
                val response = api.uploadCertificate(
                    workerId,
                    certificate.courseName ?: "",
                    certificate.certificateNumber ?: "",
                    certificate.issueDate ?: "",
                    file
                )
                if (response.isSuccessful) {
                    Log.d("WorkerViewModel", "Certificate upload response: ${response.body()}")
                    _certificateUploadSuccess.postValue(true)
                } else {
                    val error = response.errorBody()?.string() ?: "Unknown error"
                    Log.e("WorkerViewModel", "Certificate upload failed: $error")
                    _certificateUploadSuccess.postValue(false)
                }
            } catch (e: Exception) {
                Log.e("WorkerViewModel", "Certificate upload error: ${e.message}")
                _certificateUploadSuccess.postValue(false)
            }
        }
    }

    fun uploadProfilePicture(workerId: Long, file: MultipartBody.Part) {
        viewModelScope.launch {
            try {
                val response = api.uploadProfilePicture(workerId, file)
                if (response.isSuccessful && response.body() != null) {
                    Log.d("WorkerViewModel", "Profile picture upload response: ${response.body()}")
                    _selectedWorker.postValue(response.body()) // Update worker with new profile picture
                    _profilePictureUploadSuccess.postValue(true)
                } else {
                    val error = response.errorBody()?.string() ?: "Unknown error"
                    Log.e("WorkerViewModel", "Profile picture upload failed: $error")
                    _profilePictureUploadSuccess.postValue(false)
                }
            } catch (e: Exception) {
                Log.e("WorkerViewModel", "Profile picture upload error: ${e.message}")
                _profilePictureUploadSuccess.postValue(false)
            }
        }
    }

    fun fetchCategories() {
        viewModelScope.launch {
            try {
                val response = api.getCategories()
                if (response.isSuccessful && response.body() != null) {
                    _categories.value = response.body()
                    Log.d("WorkerViewModel", "Fetched categories: ${response.body()}")
                } else {
                    Log.e("WorkerViewModel", "Failed to fetch categories: ${response.code()} ${response.message()}")
                }
            } catch (e: Exception) {
                Log.e("WorkerViewModel", "Category fetch error: ${e.message}")
            }
        }
    }

    fun requestCategory(workerId: Long, categoryNames: List<String>) {
        viewModelScope.launch {
            var allSuccessful = true
            try {
                for (categoryName in categoryNames) {
                    val request = CategoryRequestDTO(categoryName)
                    val response = api.requestCategory(workerId, request)
                    Log.d("WorkerViewModel", "Category request response for $categoryName: ${response.body()}")
                    if (!response.isSuccessful) {
                        val error = response.errorBody()?.string() ?: "Unknown error"
                        Log.e("WorkerViewModel", "Category request failed for $categoryName: $error")
                        allSuccessful = false
                    }
                }
                _categoryRequestSuccess.postValue(allSuccessful)
            } catch (e: Exception) {
                Log.e("WorkerViewModel", "Category request error: ${e.message}")
                _categoryRequestSuccess.postValue(false)
            }
        }
    }
}