package com.example.mobile_tarabahoapp.AuthRepository

import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.mobile_tarabahoapp.api.RetrofitClient
import com.example.mobile_tarabahoapp.model.Worker
import com.example.mobile_tarabahoapp.model.WorkerRegisterRequest
import kotlinx.coroutines.launch

class WorkerRegisterViewModel : ViewModel() {

    private val _registrationResult = MutableLiveData<Result<Worker>>()
    val registrationResult: LiveData<Result<Worker>> = _registrationResult

    fun registerWorker(request: WorkerRegisterRequest) {
        viewModelScope.launch {
            try {
                val response = RetrofitClient.apiService.registerWorker(request)
                if (response.isSuccessful) {
                    response.body()?.let {
                        _registrationResult.postValue(Result.success(it))
                    } ?: _registrationResult.postValue(Result.failure(Exception("Empty response")))
                } else {
                    val errorMsg = response.errorBody()?.string() ?: "Registration failed"
                    _registrationResult.postValue(Result.failure(Exception(errorMsg)))
                }
            } catch (e: Exception) {
                _registrationResult.postValue(Result.failure(e))
            }
        }
    }
}
