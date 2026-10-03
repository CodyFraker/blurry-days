import { DrinkEnum } from '@/lib/db/enums';

export function calculateEffectiveDrink(baseDrink: number, intoxicationLevel: number): number {
	const effectiveDrink = baseDrink + intoxicationLevel;
	return Math.min(effectiveDrink, DrinkEnum.Shot);
}

export function getDrinkName(drinkLevel: number): { name: string; icon: string } {
	switch (drinkLevel) {
		case DrinkEnum.Sip:
			return { name: 'Sip', icon: '🥤' };
		case DrinkEnum.Gulp:
			return { name: 'Gulp', icon: '🥃' };
		case DrinkEnum.Pull:
			return { name: 'Pull', icon: '🍺' };
		case DrinkEnum.Shot:
			return { name: 'Shot', icon: '🥃' };
		default:
			return { name: 'Sip', icon: '🥤' };
	}
}
