# Interview Portal

A modern web application built with Next.js, Sanity CMS, and Firebase for managing interviews and applications.

## 🚀 Tech Stack

- **Frontend Framework**: Next.js 14
- **Content Management**: Sanity CMS
- **Authentication & Database**: Firebase
- **Styling**: Tailwind CSS, Styled Components
- **Animation**: Framer Motion
- **Icons**: Lucide React

## 📁 Project Structure

```
interview-portal/
├── app/                    # Next.js application directory
│   ├── admin/             # Admin dashboard
│   ├── application-status/ # Application status pages
│   ├── components/        # Reusable UI components
│   ├── contexts/          # React context providers
│   ├── dashboard/         # User dashboard
│   ├── firebase/          # Firebase configuration
│   ├── lib/               # Utility functions
│   ├── signin/            # Authentication pages
│   └── studio/            # Sanity Studio integration
├── public/                # Static assets
├── sanity/                # Sanity CMS configuration
└── schemas/               # Sanity schema definitions
```

## 🛠️ Setup and Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   - Create a `.env.local` file
   - Add necessary Firebase and Sanity credentials

4. Run the development server:
   ```bash
   npm run dev
   ```

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 🌟 Features

- User authentication with Firebase
- Content management with Sanity Studio
- Admin dashboard for managing applications
- Application status tracking
- Responsive design with Tailwind CSS
- Modern UI with Framer Motion animations

## 🔐 Environment Variables

Required environment variables:
- Firebase configuration
- Sanity project ID and dataset
- API keys and secrets

## 📝 License

This project is private and proprietary.

## 🤝 Contributing

Please contact the project maintainers for contribution guidelines.
