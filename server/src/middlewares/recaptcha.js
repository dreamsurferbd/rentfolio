export async function verifyRecaptcha(req, res, next) {
  // Skip reCAPTCHA check in development
  if (process.env.NODE_ENV === 'development') {
    return next();
  }

  try {
    const token = req.body.recaptchaToken || req.headers['x-recaptcha-token'];
    if (!token) return res.status(400).json({ message: 'Missing reCAPTCHA token' });

    const secret = process.env.RECAPTCHA_SECRET;
    const { data } = await axios.post(
      `https://www.google.com/recaptcha/api/siteverify?secret=${secret}&response=${token}`
    );

    if (!data.success) return res.status(400).json({ message: 'reCAPTCHA failed' });

    next();
  } catch (err) {
    next(err);
  }
}
