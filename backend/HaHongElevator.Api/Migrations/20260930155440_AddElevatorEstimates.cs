using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace HaHongElevator.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddElevatorEstimates : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ElevatorEstimates",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    CustomerName = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    PhoneNumber = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    Email = table.Column<string>(type: "character varying(254)", maxLength: 254, nullable: true),
                    Address = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: true),
                    BuildingType = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Stops = table.Column<int>(type: "integer", nullable: false),
                    CapacityKg = table.Column<int>(type: "integer", nullable: false),
                    ElevatorType = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    MotorBrand = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    DoorType = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    SpeedMps = table.Column<decimal>(type: "numeric", nullable: false),
                    EstimatedPriceMin = table.Column<decimal>(type: "numeric", nullable: false),
                    EstimatedPriceMax = table.Column<decimal>(type: "numeric", nullable: false),
                    ShaftWidth = table.Column<int>(type: "integer", nullable: false),
                    ShaftDepth = table.Column<int>(type: "integer", nullable: false),
                    CabinWidth = table.Column<int>(type: "integer", nullable: false),
                    CabinDepth = table.Column<int>(type: "integer", nullable: false),
                    PitDepth = table.Column<int>(type: "integer", nullable: false),
                    OverheadHeight = table.Column<int>(type: "integer", nullable: false),
                    MotorPowerKw = table.Column<decimal>(type: "numeric", nullable: false),
                    PowerSupply = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    BreakdownJson = table.Column<string>(type: "text", nullable: true),
                    Status = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false, defaultValue: "New"),
                    AdminNotes = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW() AT TIME ZONE 'UTC'"),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ElevatorEstimates", x => x.Id);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ElevatorEstimates");
        }
    }
}
