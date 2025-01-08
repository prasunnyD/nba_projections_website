const Roster = ({ homeRoster, awayRoster,homeTeamName, awayTeamName,onPlayerSelect  }) => {
    // Ensure the data is in array form
    console.log("Raw Home Roster (before processing):", homeRoster);
    const homeRosterArray =
        homeRoster && typeof homeRoster === "object"
            ? Object.values(homeRoster)[0] // Extract the first value (the array of players)
            : [];

    const awayRosterArray =
        awayRoster && typeof awayRoster === "object"
            ? Object.values(awayRoster)[0]
            : [];

    // const homeRosterArray = Array.isArray(homeRoster?.players) ? homeRoster.players : [];
    // const awayRosterArray = Array.isArray(awayRoster?.players) ? awayRoster.players : [];        

    console.log("Home Roster Array (processed):", homeRosterArray);
    console.log("Away Roster Array (processed):", awayRosterArray);

    return (
        <div>
            <div className="roster-container">
                <h3 className="roster-title">{homeTeamName} Team Roster</h3>
                {homeRosterArray.length > 0 ? (
                    <ul>
                        {homeRosterArray.map((player, index) => (
                            <li
                                key={index}
                                className="roster-item"
                                onClick={() => onPlayerSelect(player.PLAYER)} // Trigger player selection
                            >
                                <strong>{player.NUM || "N/A"}</strong> - {player.PLAYER || "Unknown"} ({player.POSITION || "N/A"})
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No roster data available for {homeTeamName}.</p>
                )}
            </div>

            <div className="roster-container">
                <h3 className="roster-title">{awayTeamName} Team Roster</h3>
                {awayRosterArray.length > 0 ? (
                    <ul>
                        {awayRosterArray.map((player, index) => (
                            <li
                                key={index}
                                className="roster-item"
                                onClick={() => onPlayerSelect(player.PLAYER)} // Trigger player selection
                            >
                                <strong>{player.NUM || "N/A"}</strong> - {player.PLAYER || "Unknown"} ({player.POSITION || "N/A"})
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No roster data available for {awayTeamName}.</p>
                )}
            </div>
        </div>
    );
};

export default Roster;