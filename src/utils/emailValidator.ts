export const validateEmail = (email: string): string | null => {
  if (!email) {
    return 'Email is required';
  }

  if (!email.trim()) {
    return 'Email cannot be empty';
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return 'Please enter a valid email address';
  }

  // Check for common disposable email domains
  const disposableDomains = [
    'tempmail.org',
    '10minutemail.com',
    'guerrillamail.com',
    'mailinator.com',
    'yopmail.com',
    'temp-mail.org',
  ];

  const domain = email.split('@')[1]?.toLowerCase();
  if (domain && disposableDomains.includes(domain)) {
    return 'Please use a permanent email address';
  }

  if (email.length > 254) {
    return 'Email address is too long';
  }

  return null;
};

export const sanitizeEmail = (email: string): string => {
  return email.trim().toLowerCase();
};