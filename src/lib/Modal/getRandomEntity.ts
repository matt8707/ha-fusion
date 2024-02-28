import type { Connection, HassEntities, HassEntity } from 'home-assistant-js-websocket';

/**
 * Returns a random entity_id from provided array
 */
function random(list: HassEntity[] | any[]) {
	if (!list || list.length === 0) return undefined;
	return list[Math.floor(Math.random() * list.length)];
}

/**
 * Get random entity with following requirements:
 * number | %
 */
export function getPercentageEntity(states: HassEntities) {
	const filtered = Object.values(states).filter(
		(entity) =>
			entity.attributes &&
			'unit_of_measurement' in entity.attributes &&
			entity.attributes.unit_of_measurement === '%' &&
			!isNaN(parseFloat(entity.state))
	);

	const entity = random(filtered);
	return entity?.entity_id;
}

/**
 * Get random entity with following requirements:
 * binary_sensor | sensor | state.length > 5 | !unavailable | !unknown
 */
export function getSensorEntity(states: HassEntities) {
	const sensors = Object.values(states).filter(
		(entity) =>
			entity.entity_id.startsWith('binary_sensor.') || entity.entity_id.startsWith('sensor.')
	);

	const filtered = sensors.filter(
		(entity) =>
			entity.state && entity.state.length > 5 && !['unavailable', 'unknown'].includes(entity.state)
	);

	const entity = random(filtered);
	if (entity) {
		return entity.entity_id;
	} else {
		const fallback = random(sensors);
		return fallback?.entity_id;
	}
}

/**
 * Get random timer entity
 */
export function getTimerEntity(states: HassEntities) {
	const timers = Object.values(states).filter((e) => e.entity_id.startsWith('timer.'));
	return timers.length ? random(timers).entity_id : undefined;
}

/**
 * Get random history entity
 */
export function getHistoryEntity(states: HassEntities) {
	const list = Object.values(states).filter(
		(entity) => entity.state === 'on' || entity.state === 'off'
	);
	return list.length ? random(list).entity_id : undefined;
}

/**
 * Get random weather entity
 */
export function getWeatherEntity(states: HassEntities) {
	const list = Object.values(states).filter((e) => e.entity_id.startsWith('weather.'));
	return list.length ? random(list).entity_id : undefined;
}

/**
 * Get random weather entity with forecast attribute
 */
export function getWeatherForecastEntity(states: HassEntities) {
	const list = Object.values(states).filter(
		(entity) =>
			entity.entity_id.startsWith('weather.') &&
			entity.attributes &&
			'forecast' in entity.attributes
	);
	return list.length ? random(list).entity_id : undefined;
}

/**
 * Graph sensor entity
 * list_statistic_ids and validate_statistics
 */
export function getGraphEntity(
	states: HassEntities,
	connection: any,
	callback: (id: string | undefined) => void
) {
	connection.subscribe(async (conn: Connection) => {
		if (!conn) {
			callback(undefined);
			return;
		}
		try {
			const [listStatistics, validateStatistics]: [any, any] = await Promise.all([
				conn.sendMessagePromise({ type: 'recorder/list_statistic_ids' }),
				conn.sendMessagePromise({ type: 'recorder/validate_statistics' })
			]);

			const list_statistic_ids = Object.values(listStatistics)
				.map((entry: any) =>
					entry?.statistic_id?.startsWith('sensor.') ? entry.statistic_id : null
				)
				.filter(Boolean);

			const validate_statistics_set = new Set(
				Object.values(validateStatistics)
					.map((entry: any) => entry[0]?.data?.statistic_id)
					.filter(Boolean)
			);

			const valid = list_statistic_ids.filter((id) => !validate_statistics_set.has(id));
			const filtered = Object.keys(states).filter(
				(key) => valid.includes(key) && !['unavailable', 'unknown'].includes(states[key].state)
			);

			callback(random(filtered));
		} catch (err) {
			console.error(err);
			callback(undefined);
		}
	});
}

/**
 * Get random camera entity
 */
export function getCameraEntity(states: HassEntities) {
	const filtered = Object.values(states).filter((entity) => entity.entity_id.startsWith('camera.'));
	const entity = random(filtered);
	if (entity) return entity.entity_id;
}

/**
 * Get random person entity
 */
export function getPersonEntity(states: HassEntities) {
	const filtered = Object.values(states).filter((entity) => entity.entity_id.startsWith('person.'));
	const entity = random(filtered);
	if (entity) return entity.entity_id;
}