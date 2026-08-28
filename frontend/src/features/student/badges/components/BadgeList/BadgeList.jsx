import BadgeCard from "../BadgeCard";

export default function BadgeList({
    definitions,
    findBadge
}) {
    return (
        <div className="badge-row">
            {definitions.map(definition => (
                <BadgeCard
                    key={definition.title}
                    definition={definition}
                    earnedBadge={findBadge(
                        definition.title
                    )}
                />
            ))}
        </div>
    );
}
