using System;
using System.ComponentModel.DataAnnotations;

namespace FreeTabletop.Client.Models
{
    public class JoinRoomForm
    {
        [Required(
            ErrorMessage = "A Room Code is requried"
        )]
        // [StringLength(
        //     6,
        //     MinimumLength = 6,
        //     ErrorMessage = "Invalid Room Code length"
        // )]
        public string RoomCode { get; set; }
    }
}