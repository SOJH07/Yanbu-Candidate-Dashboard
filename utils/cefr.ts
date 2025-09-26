export interface CefrInfo {
    level: string;
    onTheShoulder: boolean;
    penalty: number;
}

const CEFR_BANDS: { [key: string]: { min: number; max: number; penalty: number } } = {
    'A1': { min: 0, max: 15, penalty: -6 },
    'A2': { min: 16, max: 31, penalty: -5 },
    'B1': { min: 32, max: 47, penalty: -4 },
    'B2': { min: 48, max: 63, penalty: -2 },
    'C1': { min: 64, max: 79, penalty: -1 },
    'C2': { min: 80, max: 96, penalty: -0 },
};

export const getCefrInfo = (score: number): CefrInfo => {
    for (const level in CEFR_BANDS) {
        const band = CEFR_BANDS[level];
        if (score >= band.min && score <= band.max) {
            // "On the shoulder" is defined as being within the penalty range from the lower bound of the band.
            // e.g., For B1, lower bound is 32 and penalty is -4. Scores 32, 33, 34, 35 are on the shoulder.
            const shoulderRange = band.min + Math.abs(band.penalty);
            const onTheShoulder = score < shoulderRange && band.penalty !== 0;
            
            return {
                level,
                onTheShoulder,
                penalty: band.penalty,
            };
        }
    }
    return { level: 'N/A', onTheShoulder: false, penalty: 0 };
};
