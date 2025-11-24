import Image from "next/image";
import { motion } from "framer-motion";
import { FaRocket } from "react-icons/fa"; 
import Link from "next/link";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showImage?: boolean;
  className?: string;
}

const Logo = ({ size = "md", showImage = true, className = "" }: LogoProps) => {
  const sizeClasses = {
    sm: "text-xl",
    md: "text-2xl", 
    lg: "text-3xl"
  };

  const imageSizes = {
    sm: { width: 40, height: 40 },
    md: { width: 50, height: 50 },
    lg: { width: 60, height: 60 }
  };

  return (
    <Link href="/" className="inline-block">
      <motion.div
        className={`flex items-center space-x-3 ${className}`}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
        whileHover={{ scale: 1.05 }}
      >
        {/* Text with gradient */}
        <motion.h1 
          className={`font-bold ${sizeClasses[size]} bg-linear-to-r from-red-500 via-blue-500 to-green-500 bg-clip-text text-transparent flex items-center`}
          whileHover={{ scale: 1.1 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <motion.div
            whileHover={{ rotate: 180, scale: 1.2 }}
            transition={{ duration: 0.5 }}
          >
            <FaRocket className="text-yellow-500 mr-2" />
          </motion.div>
          jebarsanthatcroos
        </motion.h1>

        {/* Profile Image */}
        {showImage && (
          <motion.div
            whileHover={{ rotate: 360, scale: 1.1 }}
            transition={{ duration: 0.5 }}
            className="relative"
          >
            <Image
              src="/Logo.jpg"
              alt="Jebarsan Thatcroos"
              width={imageSizes[size].width}
              height={imageSizes[size].height}
              className="rounded-full shadow-lg border-2 border-gradient-to-r from-red-500 to-blue-500"
              priority
            />
            {/* Animated border gradient */}
            <motion.div 
              className="absolute inset-0 rounded-full border-2 border-transparent bg-linear-to-r from-red-500 via-blue-500 to-green-500"
              initial={{ opacity: 0 }}
              whileHover={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              style={{ 
                mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                maskComposite: 'exclude',
                WebkitMaskComposite: 'xor',
                padding: '2px'
              }}
            />
          </motion.div>
        )}
      </motion.div>
    </Link>
  );
};

// Alternative compact version without image
export const LogoCompact = ({ size = "md", className = "" }: { size?: "sm" | "md" | "lg", className?: string }) => {
  const sizeClasses = {
    sm: "text-lg",
    md: "text-xl", 
    lg: "text-2xl"
  };

  return (
    <Link href="/" className="inline-block">
      <motion.div
        className={`flex items-center space-x-2 ${className}`}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
        whileHover={{ scale: 1.05 }}
      >
        <motion.div
          whileHover={{ rotate: 180, scale: 1.2 }}
          transition={{ duration: 0.5 }}
        >
          <FaRocket className="text-yellow-500" />
        </motion.div>
        <motion.span 
          className={`font-bold ${sizeClasses[size]} bg-linear-to-r from-red-500 via-blue-500 to-green-500 bg-clip-text text-transparent`}
          whileHover={{ scale: 1.1 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          jebarsan
        </motion.span>
      </motion.div>
    </Link>
  );
};

// Text-only version for footer or minimal layouts
export const LogoText = ({ className = "" }: { className?: string }) => {
  return (
    <Link href="/" className="inline-block">
      <motion.div
        className={className}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        whileHover={{ scale: 1.05 }}
      >
        <motion.span 
          className="font-bold text-xl bg-linear-to-r from-red-500 via-blue-500 to-green-500 bg-clip-text text-transparent"
          whileHover={{ scale: 1.1 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          jebarsanthatcroos
        </motion.span>
      </motion.div>
    </Link>
  );
};

// With subtitle/tagline
export const LogoWithTagline = ({ className = "" }: { className?: string }) => {
  return (
    <Link href="/" className="inline-block">
      <motion.div
        className={`flex flex-col items-center space-y-2 ${className}`}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        whileHover={{ scale: 1.02 }}
      >
        <div className="flex items-center space-x-3">
          <motion.div
            whileHover={{ rotate: 180, scale: 1.2 }}
            transition={{ duration: 0.5 }}
          >
            <FaRocket className="text-yellow-500 text-2xl" />
          </motion.div>
          <motion.h1 
            className="font-bold text-3xl bg-linear-to-r from-red-500 via-blue-500 to-green-500 bg-clip-text text-transparent"
            whileHover={{ scale: 1.1 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            jebarsanthatcroos
          </motion.h1>
        </div>
        <motion.p 
          className="text-sm text-gray-600 font-medium"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          Full Stack Developer & Creative Problem Solver
        </motion.p>
      </motion.div>
    </Link>
  );
};

export default Logo;