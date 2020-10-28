using System;
using System.Threading.Tasks;
using System.Collections.Generic;
using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.SignalR.Client;
using FreeTabletop.Shared.Models;
using Microsoft.JSInterop;
using FreeTabletop.Client.Pages;
using FreeTabletop.Client.Models;

namespace FreeTabletop.Client.Controllers
{
    public class ClientHub
    {
        private NavigationManager NavigationManager { get; set; }

        private IJSRuntime JSRuntime { get; set; }

        private RoomBase Room { get; set; }

        private Tabletop Tabletop { get; set; }

        string RoomCode { get; set; }

        public async Task Connect(string roomCode, RoomBase room, NavigationManager navManager, IJSRuntime jsRuntime, Tabletop tabletop)
        {
            JSRuntime = jsRuntime;
            NavigationManager = navManager;
            RoomCode = roomCode;
            Room = room;
            Tabletop = tabletop;
            bool newConnection = false;
            if (!Networker.IsConnected)
            {
                newConnection = true;
                await Networker.Connect(NavigationManager.ToAbsoluteUri("/gamehub"));
            }

            if (Networker.IsConnected)
            {
                if (!newConnection)
                {
                    MessageReset();
                }
                Networker.hubConnection.On("Error:RoomNotFound", Redirect);
                Networker.hubConnection.On("Error:PlayerNotFound", Redirect);

                Networker.hubConnection.On<bool, List<PlayerEntity>, string>("Sync:TabletopInfo", Room.SyncTabletop);
                Networker.hubConnection.On<List<Entity>>("Sync:CombatOrder", Room.UpdateCombatOrder);

                Networker.hubConnection.On<string>("Set:PlayerUID", UpdateUID);
                Networker.hubConnection.On<bool, string>("Set:PlayerStatus", Room.UpdatePlayerStatus);
                Networker.hubConnection.On<List<Message>>("Set:Messages", Room.UpdatesMessages);

                Networker.hubConnection.On("Player:Kick", HandleKick);

                Networker.hubConnection.On<String, string, int[]>("Tabletop:LoadImage", Room.RenderTabletopFromImage);
                Networker.hubConnection.On("Tabletop:Clear", Room.ClearTabletop);
                Networker.hubConnection.On<List<PlayerEntity>>("Tabletop:RenderPlayerEntities", Room.RenderPlayerEntities);
                Networker.hubConnection.On<List<Creature>>("Tabletop:RenderCreatureEntities", Room.RenderCreatureEntities);
                Networker.hubConnection.On<List<NPC>>("Tabletop:RenderNPCEntities", Room.RenderNPCEntities);

                Networker.hubConnection.On<string>("Notification:PlayerConnected", ConnectedNotification);
                Networker.hubConnection.On<string>("Notification:PlayerDisconnected", DisconnectedNotification);
                Networker.hubConnection.On<string>("Notification:PlayerReconnected", ReconnectedNotification);
                Networker.hubConnection.On<string>("Notification:PlayerKicked", KickNotification);
                Networker.hubConnection.On("Notification:TakeTurn", TakeTurnNotification);
                Networker.hubConnection.On("Notification:OnDeck", OnDeckNotification);
                Networker.hubConnection.On<string>("Notification:EntityOnDeck", EntityOnDeckNotification);
                Networker.hubConnection.On<double, double>("Notification:Ping", Room.RenderPing);
            }

            if (newConnection && Networker.IsConnected)
            {
                string uid = await JSRuntime.InvokeAsync<string>("GetPlayerUID");
                Tabletop.UID = uid;
                if (String.IsNullOrEmpty(uid))
                {
                    Redirect();
                }
                else
                {
                    await Networker.hubConnection.SendAsync("Player:Resync", RoomCode, uid);
                }
            }

            await Networker.hubConnection.SendAsync("Player:SyncTabletopInfo");
            await Networker.hubConnection.SendAsync("Player:GetStatus");
        }

        private void MessageReset()
        {
            Networker.hubConnection.Remove("Error:RoomNotFound");
            Networker.hubConnection.Remove("Error:PlayerNotFound");
            Networker.hubConnection.Remove("Sync:TabletopInfo");
            Networker.hubConnection.Remove("Sync:CombatOrder");
            Networker.hubConnection.Remove("Set:PlayerUID");
            Networker.hubConnection.Remove("Set:PlayerStatus");
            Networker.hubConnection.Remove("Player:Kick");
            Networker.hubConnection.Remove("Tabletop:LoadImage");
            Networker.hubConnection.Remove("Tabletop:Clear");
            Networker.hubConnection.Remove("Tabletop:RenderPlayerEntities");
            Networker.hubConnection.Remove("Tabletop:RenderCreatureEntities");
            Networker.hubConnection.Remove("Tabletop:RenderNPCEntities");
            Networker.hubConnection.Remove("Notification:PlayerConnected");
            Networker.hubConnection.Remove("Notification:PlayerDisconnected");
            Networker.hubConnection.Remove("Notification:PlayerReconnected");
            Networker.hubConnection.Remove("Notification:PlayerKicked");
            Networker.hubConnection.Remove("Notification:TakeTurn");
            Networker.hubConnection.Remove("Notification:OnDeck");
            Networker.hubConnection.Remove("Notification:EntityOnDeck");
            Networker.hubConnection.Remove("Notification:Ping");
            Networker.hubConnection.Remove("Set:Messages");
        }

        private async Task UpdateUID(string uid)
        {
            Tabletop.UID = uid;
            await JSRuntime.InvokeVoidAsync("SetPlayerUID", uid);
        }

        private async Task HandleKick()
        {
            await JSRuntime.InvokeVoidAsync("ClearStorage");
            Redirect();
        }

        private void Redirect()
        {
            NavigationManager.NavigateTo("/");
        }

        public async Task ToggleRoomLock()
        {
            await Networker.hubConnection.SendAsync("Room:ToggleLock");
        }

        public async Task KickPlayer(PlayerEntity player)
        {
            await Networker.hubConnection.SendAsync("Room:KickPlayer", player.UID);
        }

        public async Task LoadTabletop(String imageURL, string gridType, int[] gridSize)
        {
            await Networker.hubConnection.SendAsync("Room:LoadImage", imageURL, gridType, gridSize);
        }

        public async Task ClearTabletop()
        {
            await Networker.hubConnection.SendAsync("Room:ClearTabletop");
        }

        public async Task MoveEntity(string entityUID, int[] newPosition)
        {
            await Networker.hubConnection.SendAsync("Room:MoveEntity", entityUID, newPosition);
        }

        public async Task SpawnCreature(Creature creature)
        {
            await Networker.hubConnection.SendAsync("Room:SpawnCreature", creature);
        }

        public async Task SpawnNPC(NPC npc)
        {
            await Networker.hubConnection.SendAsync("Room:SpawnNPC", npc);
        }
        public async Task SyncCombatOrder()
        {
            await Networker.hubConnection.SendAsync("Room:SyncCombatOrder");
        }

        public async Task RemoveEntityFromCombatOrder(string uid)
        {
            await Networker.hubConnection.SendAsync("Room:RemoveEntityFromCombatOrder", uid);
        }

        public async Task UpdateEntityCombatOrderPosition(string uid, int newPosition)
        {
            await Networker.hubConnection.SendAsync("Room:UpdateEntityCombatOrderPosition", uid, newPosition);
        }

        private void ConnectedNotification(string name)
        {
            Console.WriteLine("I recieved the player connected message");
            JSRuntime.InvokeVoidAsync("PlayerConnected", name);
        }
        private void DisconnectedNotification(string name)
        {
            JSRuntime.InvokeVoidAsync("PlayerDisconnected", name);
        }
        private void ReconnectedNotification(string name)
        {
            JSRuntime.InvokeVoidAsync("PlayerReconnected", name);
        }
        private void KickNotification(string name)
        {
            JSRuntime.InvokeVoidAsync("PlayerKicked", name);
        }
        private void TakeTurnNotification()
        {
            JSRuntime.InvokeVoidAsync("TakeTurn");
        }
        private void OnDeckNotification()
        {
            JSRuntime.InvokeVoidAsync("OnDeck");
        }
        private void EntityOnDeckNotification(string name)
        {
            JSRuntime.InvokeVoidAsync("EntityOnDeck", name);
        }

        public async Task PingEntity(string uid)
        {
            await Networker.hubConnection.SendAsync("Room:PingEntity", uid);
        }

        public async Task UpdateEntityAC(Entity entity, int ac)
        {
            await Networker.hubConnection.SendAsync("Room:UpdateEntityAC", entity.UID, ac);
        }

        public async Task UpdateEntityHP(Entity entity, int hp)
        {
            await Networker.hubConnection.SendAsync("Room:UpdateEntityHP", entity.UID, hp);
        }

        public async Task Ping(double x, double y)
        {
            await Networker.hubConnection.SendAsync("Room:Ping", x, y);
        }

        public async Task SendMessage(string msg, string activePlayerUID)
        {
            await Networker.hubConnection.SendAsync("Player:Message", msg, activePlayerUID);
        }
    }
}
