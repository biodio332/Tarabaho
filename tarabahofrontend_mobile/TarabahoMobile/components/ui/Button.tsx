import { Pressable, ActivityIndicator, Text, StyleSheet, type ViewStyle, type TextStyle, type PressableProps } from "react-native"

type ButtonVariant = "primary" | "secondary" | "outline" | "danger"

interface ButtonProps extends PressableProps {
  title: string
  onPress: () => void
  variant?: ButtonVariant
  disabled?: boolean
  loading?: boolean
  style?: ViewStyle | ViewStyle[]
  textStyle?: TextStyle | TextStyle[]
}

const getContainerStyle = (variant: ButtonVariant, disabled: boolean) => {
  if (disabled) return [styles.container, styles.disabled]
  if (variant === "primary") return [styles.container, styles.primary]
  if (variant === "secondary") return [styles.container, styles.secondary]
  if (variant === "danger") return [styles.container, styles.danger]
  return [styles.container, styles.outline]
}

const getTextStyle = (variant: ButtonVariant) => {
  if (variant === "outline") return [styles.text, styles.textOutline]
  if (variant === "secondary") return [styles.text, styles.textSecondary]
  return [styles.text, styles.textPrimary]
}

export default function Button({
  title,
  onPress,
  variant = "primary",
  disabled = false,
  loading = false,
  style,
  textStyle,
  ...rest
}: ButtonProps) {
  return (
    <Pressable
      {...rest}
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        ...getContainerStyle(variant, disabled),
        {
          transform: [{ scale: disabled ? 0.98 : 1 }],
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === "outline" || variant === "secondary" ? "#2563eb" : "#fff"} size="small" />
      ) : (
        <Text style={[...getTextStyle(variant), textStyle]}>
          {title}
        </Text>
      )}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    paddingHorizontal: 24,
    paddingVertical: 18,
    minHeight: 56,
  },
  primary: {
    backgroundColor: '#3b82f6',
    shadowColor: '#3b82f6',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
    elevation: 6,
  },
  secondary: {
    backgroundColor: '#f8fafc',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    shadowColor: '#000000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  danger: {
    backgroundColor: '#ef4444',
    shadowColor: '#ef4444',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
    elevation: 6,
  },
  outline: {
    borderWidth: 2,
    borderColor: '#3b82f6',
    backgroundColor: '#ffffff',
    shadowColor: '#000000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontSize: 16,
    letterSpacing: 0.3,
    fontWeight: '600',
  },
  textPrimary: {
    color: '#ffffff',
  },
  textSecondary: {
    color: '#475569',
  },
  textOutline: {
    color: '#3b82f6',
  },
})
