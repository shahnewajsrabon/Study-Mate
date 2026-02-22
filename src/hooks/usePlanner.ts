import { useContext } from 'react';
import { PlannerContext } from '../context/PlannerContextObject';

export function usePlanner() {
    const context = useContext(PlannerContext);
    if (!context) throw new Error('usePlanner must be used within PlannerProvider');
    return context;
}
