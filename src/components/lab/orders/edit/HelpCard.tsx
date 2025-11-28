import { motion } from 'framer-motion';

export default function HelpCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className='bg-blue-50 border border-blue-200 rounded-xl p-6'
    >
      <h3 className='font-semibold text-blue-900 mb-2'>Editing Guidelines</h3>
      <ul className='text-sm text-blue-800 space-y-2'>
        <li>• Update status to reflect current progress</li>
        <li>• Mark as critical for urgent results</li>
        <li>• Enter results and findings after completion</li>
        <li>• Update timeline dates accurately</li>
      </ul>
    </motion.div>
  );
}
