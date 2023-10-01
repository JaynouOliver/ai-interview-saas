import React from 'react';

function BlendShapes({ blendShapes }) {
    return (
        <ul className="blend-shapes-list">
            {blendShapes.map((shape, index) => (
                <li key={index} className="blend-shapes-item">
                    <span className="blend-shapes-label">{shape.displayName || shape.categoryName}</span>
                    <span className="blend-shapes-value" style={{ width: `calc(${+shape.score * 100}% - 120px)` }}>
                        {(+shape.score).toFixed(4)}
                    </span>
                </li>
            ))}
        </ul>
    );
}

export default BlendShapes;
