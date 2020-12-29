using System;
using System.Threading.Tasks;
using System.Collections.Generic;
using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.SignalR.Client;
using FreeTabletop.Shared.Models;
using Microsoft.JSInterop;
using FreeTabletop.Client.Pages;
using FreeTabletop.Client.Models;
using System.Timers;

namespace FreeTabletop.Client.Controllers
{
    public class ClientHub
    {
        private NavigationManager NavigationManager { get; set; }

        private IJSRuntime JSRuntime { get; set; }

        private RoomBase Room { get; set; }

        private Tabletop Tabletop { get; set; }

        string RoomCode { get; set; }

        private static Timer Timer;

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
                Networker.hubConnection.On<bool, string, string>("Set:PlayerStatus", Room.UpdatePlayerStatus);
                Networker.hubConnection.On<Message>("Set:Message", Room.RenderMessage);

                Networker.hubConnection.On("Player:Kick", HandleKick);

                Networker.hubConnection.On<String, string, int[], int, int[], List<Cell>>("Tabletop:LoadImage", Room.RenderTabletopFromImage);
                Networker.hubConnection.On("Tabletop:Clear", Room.ClearTabletop);
                Networker.hubConnection.On<List<PlayerEntity>>("Tabletop:RenderPlayerEntities", Room.RenderPlayerEntities);
                Networker.hubConnection.On<List<Creature>>("Tabletop:RenderCreatureEntities", Room.RenderCreatureEntities);
                Networker.hubConnection.On<List<NPC>>("Tabletop:RenderNPCEntities", Room.RenderNPCEntities);
                Networker.hubConnection.On<int, string>("Tabletop:SyncCells", Room.SyncCells);
                Networker.hubConnection.On<string, int[]>("Tabletop:UpdateEntityPosition", UpdateEntityPosition);
                Networker.hubConnection.On<bool>("Tabletop:UpdateLock", Room.UpdateLock);
                Networker.hubConnection.On<string>("Tabletop:LoadPopupImage", RenderPopupImage);

                Networker.hubConnection.On<string>("Notification:PlayerConnected", ConnectedNotification);
                Networker.hubConnection.On<string, string>("Notification:PlayerDisconnected", DisconnectedNotification);
                Networker.hubConnection.On<string>("Notification:PlayerReconnected", ReconnectedNotification);
                Networker.hubConnection.On<string>("Notification:PlayerKicked", KickNotification);
                Networker.hubConnection.On("Notification:TakeTurn", TakeTurnNotification);
                Networker.hubConnection.On("Notification:OnDeck", OnDeckNotification);
                Networker.hubConnection.On<string>("Notification:EntityOnDeck", EntityOnDeckNotification);
                Networker.hubConnection.On<int, int>("Notification:Ping", Room.RenderPing);
                Networker.hubConnection.On<int, string, string, string>("Notification:Roll", Room.RenderRollNotification);

                Networker.hubConnection.On<string, bool>("Entity:SetBleeding", Room.SetEntityBleeding);
                Networker.hubConnection.On<string, bool>("Entity:SetBurning", Room.SetEntityBurning);
                Networker.hubConnection.On<string, bool>("Entity:SetPoison", Room.SetEntityPoison);
                Networker.hubConnection.On<string, bool>("Entity:SetConcentration", Room.SetEntityConcentration);
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

            await Networker.hubConnection.SendAsync("Player:GetStatus");
            await Networker.hubConnection.SendAsync("Player:SyncTabletopInfo");

            Timer = new System.Timers.Timer(1000);
            Timer.Elapsed += (sender,args) => {
                try
                {
                    Networker.hubConnection.SendAsync("Player:Heartbeat");
                }
                catch
                {
                    JSRuntime.InvokeVoidAsync("Reload");
                }
            };
            Timer.AutoReset = true;
            Timer.Enabled = true;
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
            Networker.hubConnection.Remove("Notification:Roll");
            Networker.hubConnection.Remove("Set:Message");
            Networker.hubConnection.Remove("Tabletop:SyncCells");
            Networker.hubConnection.Remove("Tabletop:UpdateEntityPosition");
            Networker.hubConnection.Remove("Tabletop:UpdateLock");
            Networker.hubConnection.Remove("Tabletop:LoadPopupImage");
            Networker.hubConnection.Remove("Entity:SetBleeding");
            Networker.hubConnection.Remove("Entity:SetBurning");
            Networker.hubConnection.Remove("Entity:SetPoison");
            Networker.hubConnection.Remove("Entity:SetConcentration");
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

        public async Task LoadTabletop(String imageURL, string gridType, int[] gridData, int gridCellSize, bool fogOfWar)
        {
            int[] GridSize = {gridData[0], gridData[1]};
            int[] TabletopSize = {gridData[2], gridData[3]};
            await Networker.hubConnection.SendAsync("Room:LoadImage", imageURL, gridType, GridSize, gridCellSize, TabletopSize, fogOfWar);
        }

        public async Task ClearTabletop()
        {
            await Networker.hubConnection.SendAsync("Room:ClearTabletop");
        }

        public void MoveEntity(string entityUID, int[] newPosition)
        {
            Networker.hubConnection.SendAsync("Room:MoveEntity", entityUID, newPosition);
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
            JSRuntime.InvokeVoidAsync("PlayerConnected", name);
        }
        private void DisconnectedNotification(string name, string uid)
        {
            JSRuntime.InvokeVoidAsync("PlayerDisconnected", name);
            for (int i = 0; i < Tabletop.Players.Count; i++)
            {
                if (Tabletop.Players[i].UID == uid)
                {
                    Tabletop.Players[i].IsConnected = false;
                    break;
                }
            }
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

        public async Task Ping(int x, int y)
        {
            await Networker.hubConnection.SendAsync("Room:Ping", x, y);
        }

        public async Task SendMessage(string activePlayerUID, string msg)
        {
            if (activePlayerUID != null)
            {
                await Networker.hubConnection.SendAsync("Player:Message", msg, activePlayerUID);
            }
            else
            {
                await Networker.hubConnection.SendAsync("Room:Message", msg);
            }
        }

        public async Task Disconnect()
        {
            await Networker.hubConnection.SendAsync("Player:Disconnect");
        }

        public void RemoveEntity(string uid)
        {
            Networker.hubConnection.SendAsync("Room:RemoveEntity", uid);
        }

        public async Task AnnounceRoll(int diceCount, string die, string results)
        {
            await Networker.hubConnection.SendAsync("Room:AnnounceRoll", diceCount, die, results);
        }

        public void ChangeCellStyle(int cellIndex, string style)
        {
            Networker.hubConnection.SendAsync("Room:ChangeCellStyle", cellIndex, style);
        }

        public void UpdateEntityPosition(string uid, int[] position)
        {
            JSRuntime.InvokeVoidAsync("UpdateEntityPosition", uid, position, Tabletop.CellSize);
        }

        public void LoadPopupImage(string url)
        {
            Networker.hubConnection.SendAsync("Room:LoadPopupImage", url);
        }

        public void RenderPopupImage(string url)
        {
            JSRuntime.InvokeVoidAsync("RenderPopupImage", url);
        }

        public void SetBleeding(string uid, bool isBleeding)
        {
            Networker.hubConnection.SendAsync("Room:SetBleeding", uid, isBleeding);
        }

        public void SetBurning(string uid, bool isBurning)
        {
            Networker.hubConnection.SendAsync("Room:SetBurning", uid, isBurning);
        }

        public void SetPoison(string uid, bool isPoisoned)
        {
            Networker.hubConnection.SendAsync("Room:SetPoison", uid, isPoisoned);
        }

        public void SetConcentration(string uid, bool isConcentrating)
        {
            Networker.hubConnection.SendAsync("Room:SetConcentration", uid, isConcentrating);
        }
    }
}
