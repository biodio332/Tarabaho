import { useState, forwardRef } from "react"
import { View, Text, TextInput, StyleSheet, type TextInputProps, TouchableWithoutFeedback, Keyboard } from "react-native"

type TextFieldProps = {
  label?: string
  error?: string
  helperText?: string
  containerStyle?: any
  inputStyle?: any
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  variant?: 'outlined' | 'filled'
  size?: 'small' | 'medium' | 'large'
  showBorder?: boolean
} & TextInputProps

const TextField = forwardRef<TextInput, TextFieldProps>(
  ({ 
    label, 
    error, 
    helperText, 
    containerStyle, 
    inputStyle, 
    leftIcon, 
    rightIcon,
    variant = 'outlined',
    size = 'medium',
    showBorder = true,
    onFocus, 
    onBlur, 
    ...props 
  }, ref) => {
    const [focused, setFocused] = useState(false)
    const hasError = !!(error && error.length > 0)

    const getBorderStyle = () => {
      if (!showBorder) return styles.noBorder;
      if (hasError) return styles.borderError;
      if (focused) return styles.borderFocused;
      if (variant === 'filled') return styles.borderFilled;
      return styles.borderDefault;
    }

    const getContainerStyle = () => {
      return [
        styles.inputContainer,
        getBorderStyle(),
        variant === 'filled' && styles.filledContainer,
        size === 'small' && styles.smallContainer,
        size === 'large' && styles.largeContainer
      ]
    }

    return (
      <View style={[styles.container, containerStyle]}>
        {label ? <Text style={[styles.label, hasError && styles.labelError]}>{label}</Text> : null}
        <TouchableWithoutFeedback onPress={() => {}}>
          <View style={getContainerStyle()}>
            {leftIcon && <View style={styles.iconContainer}>{leftIcon}</View>}
            <TextInput
              ref={ref}
              style={[
                styles.input, 
                size === 'small' && styles.smallInput,
                size === 'large' && styles.largeInput,
                inputStyle
              ]}
              placeholderTextColor="#9ca3af"
              onFocus={(e) => {
                setFocused(true)
                onFocus?.(e)
              }}
              onBlur={(e) => {
                setFocused(false)
                onBlur?.(e)
              }}
              autoCorrect={props.autoCorrect ?? false}
              editable={props.editable ?? true}
              keyboardType={props.keyboardType ?? "default"}
              returnKeyType={props.returnKeyType ?? "done"}
              blurOnSubmit={props.blurOnSubmit ?? true}
              autoCapitalize={props.autoCapitalize ?? "none"}
              autoComplete={props.autoComplete ?? "off"}
              textContentType={props.textContentType}
              enablesReturnKeyAutomatically={true}
              clearButtonMode="while-editing"
              {...props}
            />
            {rightIcon && <View style={styles.iconContainer}>{rightIcon}</View>}
          </View>
        </TouchableWithoutFeedback>
        {hasError ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : helperText ? (
          <Text style={styles.helperText}>{helperText}</Text>
        ) : null}
      </View>
    )
  }
)

TextField.displayName = "TextField"

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginBottom: 20,
  },
  label: {
    marginBottom: 8,
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    letterSpacing: 0.5,
  },
  labelError: {
    color: "#ef4444",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1.5,
    paddingHorizontal: 16,
    minHeight: 56,
    backgroundColor: "#ffffff",
  },
  iconContainer: {
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noBorder: {
    borderWidth: 0,
    backgroundColor: 'transparent',
  },
  filledContainer: {
    backgroundColor: '#f3f4f6',
    borderWidth: 0,
  },
  smallContainer: {
    minHeight: 44,
    paddingHorizontal: 12,
  },
  largeContainer: {
    minHeight: 64,
    paddingHorizontal: 20,
  },
  borderFilled: {
    borderWidth: 0,
    backgroundColor: '#f3f4f6',
  },
  borderDefault: {
    borderColor: "#d1d5db",
    backgroundColor: "#ffffff",
    shadowColor: "#000000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
    elevation: 1,
  },
  borderFocused: {
    borderColor: "#3b82f6",
    backgroundColor: "#ffffff",
    shadowColor: "#3b82f6",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 4,
  },
  borderError: {
    borderColor: "#ef4444",
    backgroundColor: "#fef2f2",
    shadowColor: "#ef4444",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
    color: "#111827",
    fontWeight: "500",
  },
  smallInput: {
    paddingVertical: 12,
    fontSize: 14,
  },
  largeInput: {
    paddingVertical: 18,
    fontSize: 18,
  },
  errorText: {
    marginTop: 6,
    fontSize: 14,
    color: "#ef4444",
    fontWeight: "500",
  },
  helperText: {
    marginTop: 6,
    fontSize: 14,
    color: "#6b7280",
    fontWeight: "400",
  },
})

export default TextField
