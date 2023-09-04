export async function fetchUserData(query) {
    // Implement your GraphQL query and fetch logic here

    try {
        const response = await fetch("https://01.kood.tech/api/graphql-engine/v1/graphql", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${localStorage.getItem('JWT')}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ query }) // replace
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch user data: ${response.statusText}`);
        }

        const data = await response.json();
        // console.log(data)
        return data;

    } catch (error) {
        console.error("Error fetching user data:", error);
        throw error; // Rethrow the error for the calling code to handle
    }
}