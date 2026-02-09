import * as msal from "@azure/msal-node"
import "../utils/types"
import { clientId, clientSecret } from "../utils/types"

export const msalClient = new msal.ConfidentialClientApplication({
    auth: {
        clientId: clientId,
        clientSecret: clientSecret,
        authority: "`https://login.microsoftonline.com/${tenantId}",
    }
})

