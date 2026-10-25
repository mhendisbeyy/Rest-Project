import LessonCatalog from '../../../../components/lessons/LessonCatalog';
import { bindingPage } from '../../../../components/lessons/lessonContent';

export const metadata = { title: 'Spring MVC Parametre Bağlama | REST Atölyesi' };

export default function ParameterBindingPage() { return <LessonCatalog lesson={bindingPage} />; }
