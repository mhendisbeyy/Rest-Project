import LessonCatalog from '../../../../components/lessons/LessonCatalog';
import { methodsPage } from '../../../../components/lessons/lessonContent';

export const metadata = { title: 'HTTP Metotları | REST Atölyesi' };

export default function HttpMethodsPage() { return <LessonCatalog lesson={methodsPage} />; }
