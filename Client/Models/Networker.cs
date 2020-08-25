
using System;
using System.Collections.Generic;
using Microsoft.AspNetCore.SignalR.Client;
using System.Threading.Tasks;

public static class Networker
{
    public static HubConnection hubConnection = null;
    public static bool IsConnected = false;

    public static async Task Connect(System.Uri url)
    {
        if (!IsConnected)
        {
            hubConnection = new HubConnectionBuilder()
            .WithUrl(url)
            .Build();
            await hubConnection.StartAsync();
            IsConnected = hubConnection.State == HubConnectionState.Connected;
        }
    }
}