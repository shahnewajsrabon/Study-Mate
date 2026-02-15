export interface TemplateTopic {
    name: string;
}

export interface TemplateChapter {
    name: string;
    topics: TemplateTopic[];
}

export interface TemplateSubject {
    name: string;
    icon: string; // Lucide icon name
    color: string; // Tailwind color class (e.g., text-blue-500)
    chapters: TemplateChapter[];
}

export interface SyllabusTemplate {
    id: string;
    name: string; // e.g., "HSC Science", "SSC General"
    subjects: TemplateSubject[];
}

export const SYLLABUS_TEMPLATES: SyllabusTemplate[] = [
    {
        id: 'hsc-science-2026',
        name: 'HSC Science (2026)',
        subjects: [
            {
                name: 'Physics 1st Paper',
                icon: 'Zap',
                color: 'text-violet-500',
                chapters: [
                    { name: 'Physical World and Measurement', topics: [{ name: 'Units' }, { name: 'Dimensions' }] },
                    { name: 'Vectors', topics: [{ name: 'Scalar & Vector' }, { name: 'Vector Addition' }, { name: 'Dot & Cross Product' }] },
                    { name: 'Dynamics', topics: [{ name: 'Newton’s Laws' }, { name: 'Friction' }, { name: 'Banking of Roads' }] },
                    { name: 'Newtonian Mechanics', topics: [] },
                    { name: 'Work, Energy and Power', topics: [] },
                    { name: 'Gravitation and Gravity', topics: [] },
                    { name: 'Structural Properties of Matter', topics: [] },
                    { name: 'Periodic Motion', topics: [] },
                    { name: 'Ideal Gas and Kinetics of Gas', topics: [] }
                ]
            },
            {
                name: 'Physics 2nd Paper',
                icon: 'Zap',
                color: 'text-violet-500',
                chapters: [
                    { name: 'Thermodynamics', topics: [] },
                    { name: 'Static Electricity', topics: [] },
                    { name: 'Current Electricity', topics: [] },
                    { name: 'Magnetic Effects of Current', topics: [] },
                    { name: 'Electromagnetic Induction', topics: [] },
                    { name: 'Geometrical Optics', topics: [] },
                    { name: 'Physical Optics', topics: [] },
                    { name: 'Modern Physics', topics: [] },
                    { name: 'Atomic Model', topics: [] },
                    { name: 'Semiconductors', topics: [] }
                ]
            },
            {
                name: 'Chemistry 1st Paper',
                icon: 'Beaker',
                color: 'text-teal-500',
                chapters: [
                    { name: 'Qualitative Chemistry', topics: [] },
                    { name: 'Periodic Properties', topics: [] },
                    { name: 'Chemical Bonding', topics: [] },
                    { name: 'Chemical Changes', topics: [] },
                    { name: 'Work Oriented Chemistry', topics: [] }
                ]
            },
            {
                name: 'Chemistry 2nd Paper',
                icon: 'Beaker',
                color: 'text-teal-500',
                chapters: [
                    { name: 'Environmental Chemistry', topics: [] },
                    { name: 'Organic Chemistry', topics: [] },
                    { name: 'Quantitative Chemistry', topics: [] },
                    { name: 'Electrochemistry', topics: [] },
                    { name: 'Economic Chemistry', topics: [] }
                ]
            },
            {
                name: 'Higher Math 1st Paper',
                icon: 'Calculator',
                color: 'text-blue-500',
                chapters: [
                    { name: 'Matrices and Determinants', topics: [] },
                    { name: 'Vectors', topics: [] },
                    { name: 'Straight Lines', topics: [] },
                    { name: 'Circle', topics: [] },
                    { name: 'Permutation and Combination', topics: [] },
                    { name: 'Trigonometry', topics: [] },
                    { name: 'Functions', topics: [] },
                    { name: 'Differentiation', topics: [] },
                    { name: 'Integration', topics: [] }
                ]
            },
            {
                name: 'Higher Math 2nd Paper',
                icon: 'Calculator',
                color: 'text-blue-500',
                chapters: [
                    { name: 'Real Numbers', topics: [] },
                    { name: 'Linear Programming', topics: [] },
                    { name: 'Complex Numbers', topics: [] },
                    { name: 'Polynomials', topics: [] },
                    { name: 'Binomial Expansion', topics: [] },
                    { name: 'Conics', topics: [] },
                    { name: 'Inverse Trigonometry', topics: [] },
                    { name: 'Statics', topics: [] },
                    { name: 'Dynamics', topics: [] },
                    { name: 'Probability', topics: [] }
                ]
            },
            {
                name: 'Biology 1st Paper',
                icon: 'Dna',
                color: 'text-green-500',
                chapters: [
                    { name: 'Cell and its Structure', topics: [] },
                    { name: 'Cell Division', topics: [] },
                    { name: 'Cell Chemistry', topics: [] },
                    { name: 'Bioenergetics', topics: [] },
                    { name: 'Algae and Fungi', topics: [] },
                    { name: 'Bryophyta and Pteridophyta', topics: [] },
                    { name: 'Naked Seed and Covered Seed Plants', topics: [] },
                    { name: 'Tissue and Tissue System', topics: [] },
                    { name: 'Plant Physiology', topics: [] },
                    { name: 'Plant Reproduction', topics: [] },
                    { name: 'Biotechnology', topics: [] }
                ]
            },
            {
                name: 'Biology 2nd Paper',
                icon: 'Dna',
                color: 'text-green-500',
                chapters: [
                    { name: 'Animal Diversity and Classification', topics: [] },
                    { name: 'Introduction to Animal', topics: [] },
                    { name: 'Digestion and Absorption', topics: [] },
                    { name: 'Blood and Circulation', topics: [] },
                    { name: 'Breathing and Respiration', topics: [] },
                    { name: 'Excretion and Osmoregulation', topics: [] },
                    { name: 'Locomotion and Movement', topics: [] },
                    { name: 'Coordination and Control', topics: [] },
                    { name: 'Human Reproduction', topics: [] },
                    { name: 'Human Immunity', topics: [] },
                    { name: 'Genetics and Evolution', topics: [] },
                    { name: 'Animal Behavior', topics: [] }
                ]
            },
            {
                name: 'ICT',
                icon: 'Cpu',
                color: 'text-indigo-500',
                chapters: [
                    { name: 'Information and Communication Technology: World and Bangladesh', topics: [] },
                    { name: 'Communication Systems and Networking', topics: [] },
                    { name: 'Number Systems and Digital Devices', topics: [] },
                    { name: 'Web Design and HTML', topics: [] },
                    { name: 'Programming Language (C)', topics: [] },
                    { name: 'Database Management System', topics: [] }
                ]
            }
        ]
    },
    {
        id: 'ssc-science-2026',
        name: 'SSC Science (2026)',
        subjects: [
            {
                name: 'Physics',
                icon: 'Zap',
                color: 'text-violet-500',
                chapters: [
                    { name: 'Physical Quantities and Their Measurement', topics: [] },
                    { name: 'Motion', topics: [] },
                    { name: 'Force', topics: [] },
                    { name: 'Work, Power and Energy', topics: [] },
                    { name: 'State of Matter and Pressure', topics: [] },
                    { name: 'Effect of Heat on Matter', topics: [] },
                    { name: 'Waves and Sound', topics: [] },
                    { name: 'Reflection of Light', topics: [] },
                    { name: 'Refraction of Light', topics: [] },
                    { name: 'Static Electricity', topics: [] },
                    { name: 'Current Electricity', topics: [] },
                    { name: 'Magnetic Effect of Current', topics: [] },
                    { name: 'Modern Physics and Electronics', topics: [] },
                    { name: 'Previously Saved Lives', topics: [] }
                ]
            },
            {
                name: 'Chemistry',
                icon: 'Beaker',
                color: 'text-teal-500',
                chapters: [
                    { name: 'Concept of Chemistry', topics: [] },
                    { name: 'State of Matter', topics: [] },
                    { name: 'Structure of Matter', topics: [] },
                    { name: 'Periodic Table', topics: [] },
                    { name: 'Chemical Bond', topics: [] },
                    { name: 'Mole and Chemical Equation', topics: [] },
                    { name: 'Chemical Reaction', topics: [] },
                    { name: 'Chemistry and Energy', topics: [] },
                    { name: 'Acid-Base Balance', topics: [] },
                    { name: 'Mineral Resources: Metal-Nonmetal', topics: [] },
                    { name: 'Mineral Resources: Fossils', topics: [] },
                    { name: 'Chemistry in Our Lives', topics: [] }
                ]
            },
            {
                name: 'Higher Math',
                icon: 'Calculator',
                color: 'text-blue-500',
                chapters: [
                    { name: 'Set And Function', topics: [] },
                    { name: 'Algebraic Expression', topics: [] },
                    { name: 'Geometry', topics: [] },
                    { name: 'Geometric Construction', topics: [] },
                    { name: 'Equation', topics: [] },
                    { name: 'Inequality', topics: [] },
                    { name: 'Infinite Series', topics: [] },
                    { name: 'Trigonometry', topics: [] },
                    { name: 'Exponent and Logarithm', topics: [] },
                    { name: 'Binomial Expansion', topics: [] },
                    { name: 'Coordinate Geometry', topics: [] },
                    { name: 'Planar Vector', topics: [] },
                    { name: 'Solid Geometry', topics: [] },
                    { name: 'Probability', topics: [] }
                ]
            },
            {
                name: 'General Math',
                icon: 'Calculator',
                color: 'text-blue-500',
                chapters: [
                    { name: 'Real Number', topics: [] },
                    { name: 'Set and Function', topics: [] },
                    { name: 'Algebraic Expression', topics: [] },
                    { name: 'Exponents and Logarithms', topics: [] },
                    { name: 'Equation in One Variable', topics: [] },
                    { name: 'Lines, Angles, and Triangles', topics: [] },
                    { name: 'Practical Geometry', topics: [] },
                    { name: 'Circle', topics: [] },
                    { name: 'Trigonometric Ratio', topics: [] },
                    { name: 'Distance and Elevation', topics: [] },
                    { name: 'Algebraic Ratio and Proportion', topics: [] },
                    { name: 'Simple Simultaneous Equations in Two Variables', topics: [] },
                    { name: 'Finite Series', topics: [] },
                    { name: 'Ratio, Symmetry, and Rotation', topics: [] },
                    { name: 'Area Related Theorems and Constructions', topics: [] },
                    { name: 'Mensurement', topics: [] },
                    { name: 'Statistics', topics: [] }
                ]
            },
            {
                name: 'Biology',
                icon: 'Dna',
                color: 'text-green-500',
                chapters: [
                    { name: 'Lessons on Life', topics: [] },
                    { name: 'Cells and Tissues of Organisms', topics: [] },
                    { name: 'Cell Division', topics: [] },
                    { name: 'Bioenergetics', topics: [] },
                    { name: 'Food, Nutrition and Digestion', topics: [] },
                    { name: 'Transport in Organisms', topics: [] },
                    { name: 'Gas Exchange', topics: [] },
                    { name: 'Excretion', topics: [] },
                    { name: 'Firmness and Locomotion', topics: [] },
                    { name: 'Coordination', topics: [] },
                    { name: 'Reproduction in Organisms', topics: [] },
                    { name: 'Heredity in Organisms and Evolution', topics: [] },
                    { name: 'Environment of Organisms', topics: [] },
                    { name: 'Biotechnology', topics: [] }
                ]
            }
        ]
    }
];
