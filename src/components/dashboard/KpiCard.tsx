import React from 'react';

type Props = { title: string; value: string; };

const KpiCard: React.FC<Props> = ({ title, value }) => (
    <div className="bg-white p-4 rounded-lg border border-gray-200">
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-2xl font-semibold text-gray-900 mt-1">{value}</p>
    </div>
);

export default KpiCard;