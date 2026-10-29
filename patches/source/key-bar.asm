; Six PNG-derived 16x16 graphics; temporary state belongs to the modal stack.
DEF STRIP EQU $9de0
DEF FRAME_SIZE EQU 132
SECTION "Key bar", ROMX[$4000], BANK[$40]
KeyBarHook::
    call $08e8
    push af
    push bc
    push de
    push hl
    ldh a, [$ff90]
    and $08
    jr z, .done
    ldh a, [$ff40]
    and $38
    cp $08
    jr nz, .done
    ldh a, [$ff42]
    and a
    jr nz, .done
    ldh a, [$ff43]
    and a
    jr nz, .done
    call KeyBarModal
.done
    pop hl
    pop de
    pop bc
    pop af
    ldh a, [$ffb3]
    ld b, $00
    ret
KeyBarModal:
    ; 0..17 tile-pair IDs; 18/19 masks; 20 VBK; 21 BCPS; 22 attribute;
    ; 23..62 palettes; 63..122 map rows; 123 allocator count;
    ; 124..131 native palette. After palette caching, bytes 23..46 are reused
    ; for sixteen subtank cells and four (OAM offset,Y) backups.
    add sp, -128
    add sp, -(FRAME_SIZE-128)
    ldh a, [$ff4f]
    ld hl, sp+20
    ld [hl], a
    call $0d5f
    ldh a, [$ff91]
    and a
    jr z, .layoutChecked
    ; Upper weapon icons may already use the five key-menu palettes.
    ; Back up their complete attributes after allocation succeeds instead
    ; of aborting on normal progression inventories.
.layoutChecked
    xor a
    ldh [$ff4f], a
    ; Temporary 64-byte usage table shares storage with the later backups.
    ld hl, sp+23
    ld b, $40
.clearUsage
    ld [hl+], a
    dec b
    jr nz, .clearUsage
    ld hl, sp+23
    ld b, h
    ld c, l
    ld hl, $9c00
.markMap
    ld a, [hl+]
    call MarkUsedPair
    ld a, h
    cp $a0
    jr nz, .markMap
    ; Upper signed BG tiles overlap OBJ VRAM. Mark every OAM tile pair.
    ld hl, $fe02
.markOam
    ld a, [hl]
    bit 7, a
    jr z, .nextOam
    call MarkUsedPair
.nextOam
    inc hl
    inc hl
    inc hl
    inc hl
    ld a, l
    cp $a2
    jr nz, .markOam
    ld hl, sp+123
    xor a
    ld [hl], a
    ld c, $02
.candidate
    ld a, c
    rrca
    rrca
    and $3f
    ld e, a
    ld d, $00
    ld hl, sp+23
    add hl, de
    bit 1, c
    jr nz, .secondPair
    bit 0, [hl]
    jr .pairChecked
.secondPair
    bit 1, [hl]
.pairChecked
    jr nz, .used
    ld a, c
    call TileAddress
    ld b, $20
.blankTile
    ld a, [hl+]
    and a
    jr nz, .used
    dec b
    jr nz, .blankTile
    ld hl, sp+123
    ld e, [hl]
    inc [hl]
    ld d, $00
    ld hl, sp+0
    add hl, de
    ld [hl], c
    ld hl, sp+123
    ld a, [hl]
    cp $12
    jr z, .found
.used
    ld a, c
    add $02
    ld c, a
    jr nz, .candidate
    jp .abort
.found
    ld hl, sp+63
    ld d, h
    ld e, l
    ld hl, STRIP
    call SaveStrip
    ldh a, [$ff91]
    and a
    jr z, .palettesSaved
    ldh a, [$ff68]
    ld hl, sp+21
    ld [hl], a
    ld hl, sp+23
    ld d, h
    ld e, l
    ld c, $08
    call ReadPalette
    ld c, $10
    call ReadPalette
    ld c, $20
    call ReadPalette
    ld c, $28
    call ReadPalette
    ld c, $30
    call ReadPalette
    ld hl, sp+124
    ld d, h
    ld e, l
    ld c, $18
    call ReadPalette
    call SaveAttributes
    ld hl, sp+23
    ld de, $d400
    ld b, 40
    call CacheOriginal
    ld hl, sp+124
    ld b, 8
    call CacheOriginal
    call InstallPalettes
.palettesSaved
    ld hl, sp+0
    ld d, h
    ld e, l
    ld hl, SpriteTiles
    ld c, $12
    call InstallTiles
    ld hl, STRIP
    xor a
    call FillStrip
    ldh a, [$ff91]
    and a
    jr z, .draw
    ld a, $01
    ldh [$ff4f], a
    ld hl, STRIP
    ld a, $06
    call FillStrip
    xor a
    ldh [$ff4f], a
.draw
    ld hl, sp+23
    call HideSubtanks
    ld hl, sp+0
    call DrawKeys
    ld hl, sp+18
    ld a, [$d3e2]
    ld [hl+], a
    ld a, [$d3e3]
    ld [hl], a
    call $0d80
.loop
    call $0a99
    call $08e8
    ldh a, [$ff90]
    and $02
    jr nz, .close
    ld hl, sp+18
    ld a, [$d3e2]
    cp [hl]
    jr nz, .changed
    inc hl
    ld a, [$d3e3]
    cp [hl]
    jr z, .loop
.changed
    ld hl, sp+18
    ld a, [$d3e2]
    ld [hl+], a
    ld a, [$d3e3]
    ld [hl], a
    call $0d5f
    ld hl, sp+0
    call DrawKeys
    call $0d80
    jr .loop
.close
    call $0d5f
    xor a
    ldh [$ff4f], a
    ld hl, sp+0
    call ClearTiles
    ld hl, sp+63
    ld de, STRIP
    call RestoreStrip
    ld hl, sp+23
    call RestoreSubtanks
    ldh a, [$ff91]
    and a
    jr z, .restored
    call RestoreAttributes
    call RestoreModalPalettes
    ld hl, sp+21
    ld a, [hl]
    ldh [$ff68], a
.restored
    call $0d80
    ld hl, sp+20
    ld a, [hl]
    ldh [$ff4f], a
    xor a
    ldh [$ff90], a
    add sp, FRAME_SIZE-128
    add sp, 127
    inc sp
    ret
.abort
    call $0d80
    ld hl, sp+20
    ld a, [hl]
    ldh [$ff4f], a
    add sp, FRAME_SIZE-128
    add sp, 127
    inc sp
    ret
; CGB WRAM bank 7, D000..D3FF is reserved by this patch for the modal
; attribute backup. Original ROM code selects only WRAM banks 0/1 and 2.
; The live stack remains in bank 1. Never call/push/enable IRQs with bank 7
; selected; each byte transfer switches back before EI or the next call.
SaveAttributes:
    ld a, $01
    ldh [$ff4f], a
    ldh a, [$ff70]
    ld b, a
    ld hl, $9c00
    ld de, $d000
.byte
    ld a, [hl]
    ld c, a
    di
    ld a, $07
    ldh [$ff70], a
    ld a, c
    ld [de], a
    ld a, b
    ldh [$ff70], a
    ei

.next
    inc de
    inc hl
    ld a, h
    cp $a0
    jr nz, .byte
    xor a
    ldh [$ff4f], a
    ret
RestoreAttributes:
    ld a, $01
    ldh [$ff4f], a
    ldh a, [$ff70]
    ld b, a
    ld hl, $9c00
    ld de, $d000
.byte
    di
    ld a, $07
    ldh [$ff70], a
    ld a, [de]
    ld c, a
    ld a, b
    ldh [$ff70], a
    ei
    ld a, c
    ld [hl+], a
    inc de
    ld a, h
    cp $a0
    jr nz, .byte
    ret
CacheOriginal:
.byte
    ldh a, [$ff70]
    push af
    ld a, [hl+]
    ld c, a
    di
    ld a, 7
    ldh [$ff70], a
    ld a, c
    ld [de], a
    ; Original modal stack is always in WRAM bank 1.
    ld a, 1
    ldh [$ff70], a
    pop af
    ldh [$ff70], a
    ei
    inc de
    dec b
    jr nz, .byte
    ret
RestoreModalPalettes:
    ld de, $d400
    ld c, $88
    call RestoreOriginalPalette
    ld c, $90
    call RestoreOriginalPalette
    ld c, $a0
    call RestoreOriginalPalette
    ld c, $a8
    call RestoreOriginalPalette
    ld c, $b0
    call RestoreOriginalPalette
    ld c, $98
    jp RestoreOriginalPalette
RestoreOriginalPalette:
    ld a, c
    ldh [$ff68], a
    ld b, 8
.byte
    ldh a, [$ff70]
    ld c, a
    di
    ld a, 7
    ldh [$ff70], a
    ld a, [de]
    ld [ $ff69 ], a ; LCD is in VBlank or disabled here.
    ld a, c
    ldh [$ff70], a
    ei
    inc de
    dec b
    jr nz, .byte
    ret
MarkUsedPair:
    push hl
    push af
    rrca
    rrca
    and $3f
    ld e, a
    ld d, $00
    ld h, b
    ld l, c
    add hl, de
    pop af
    bit 1, a
    jr nz, .second
    set 0, [hl]
    jr .done
.second
    set 1, [hl]
.done
    pop hl
    ret
TileAddress:
    ld l, a
    ld h, $09
    bit 7, a
    jr z, .shift
    ld h, $08
.shift
    add hl, hl
    add hl, hl
    add hl, hl
    add hl, hl
    ret
Copy:
    ld a, [hl+]
    ld [de], a
    inc de
    dec b
    jr nz, Copy
    ret
SaveStrip:
    ld c, $03
.row
    ld b, $14
    call Copy
    ld a, l
    add $0c
    ld l, a
    jr nc, .next
    inc h
.next
    dec c
    jr nz, .row
    ret
RestoreStrip:
    ld c, $03
.row
    ld b, $14
    call Copy
    ld a, e
    add $0c
    ld e, a
    jr nc, .next
    inc d
.next
    dec c
    jr nz, .row
    ret
FillStrip:
    ld c, $03
.row
    ld b, $14
.tile
    ld [hl+], a
    dec b
    jr nz, .tile
    push af
    ld a, l
    add $0c
    ld l, a
    jr nc, .next
    inc h
.next
    pop af
    dec c
    jr nz, .row
    ret
ReadPalette:
    ld b, $08
.byte
    ld a, c
    ldh [$ff68], a
    ldh a, [$ff69]
    ld [de], a
    inc de
    inc c
    dec b
    jr nz, .byte
    ret
WritePalette:
    ld a, c
    ldh [$ff68], a
    ld b, $08
.byte
    ld a, [hl+]
    ldh [$ff69], a
    dec b
    jr nz, .byte
    ret
InstallPalettes:
    ld c, $3e ; existing dark blue from native palette 7
    ld a, c
    ldh [$ff68], a
    ldh a, [$ff69]
    ld e, a
    inc c
    ld a, c
    ldh [$ff68], a
    ldh a, [$ff69]
    ld d, a
    ld hl, WeaponColors
    ld c, $88
    call WritePalette
    ld c, $90
    call WritePalette
    ld c, $a0
    call WritePalette
    ld c, $a8
    call WritePalette
    ld c, $b0
    call WritePalette
    ld c, $88
    call WriteBackground
    ld c, $90
    call WriteBackground
    ld c, $a0
    call WriteBackground
    ld c, $a8
    call WriteBackground
    ld c, $b0
    call WriteBackground
    ld a, $38 ; native palette 7, black interior
    call ReadMenuColor
    ld c, $88
    call WriteBackground
    ld c, $90
    call WriteBackground
    ld c, $a0
    call WriteBackground
    ld c, $a8
    call WriteBackground
    ld a, $3a ; native palette 7, light frame
    call ReadMenuColor
    ld c, $8e
    call WriteBackground
    ld c, $96
    call WriteBackground
    ld c, $a6
    call WriteBackground
    ld c, $ae
    call WriteBackground
    ret
ReadMenuColor:
    ld c, a
    ldh [$ff68], a
    ldh a, [$ff69]
    ld e, a
    inc c
    ld a, c
    ldh [$ff68], a
    ldh a, [$ff69]
    ld d, a
    ret
WriteBackground:
    ld a, c
    ldh [$ff68], a
    ld a, e
    ldh [$ff69], a
    ld a, d
    ldh [$ff69], a
    ret
InstallTiles:
    ld a, [de]
    inc de
    push de
    push hl
    call TileAddress
    ld d, h
    ld e, l
    pop hl
    ld b, $20
    call Copy
    pop de
    dec c
    jr nz, InstallTiles
    ret
ClearTiles:
    ld c, $12
.group
    ld a, [hl+]
    push hl
    call TileAddress
    ld b, $20
    xor a
.byte
    ld [hl+], a
    dec b
    jr nz, .byte
    pop hl
    dec c
    jr nz, .group
    ret
DrawKeys:
    ld a, [$d3e2]
    ld d, a
    ld e, $00
.boss
    srl d
    jr nc, .missing
    ld a, e
    and $01
    push af
    push hl
    push de
    ld d, $00
    ld hl, BossAttributes
    add hl, de
    ld c, [hl]
    pop de
    pop hl
    pop af
    jr .writeBoss
.missing
    ld a, $02
    push af
    push hl
    push de
    ld d, $00
    ld hl, BossAttributes
    add hl, de
    ld c, [hl]
    pop de
    pop hl
    pop af
.writeBoss
    call GetBase
    call DrawIcon
    inc e
    ld a, e
    cp $08
    jr nz, .boss
    ld a, [$d3e3]
    ld d, a
.sigma
    srl d
    jr nc, .missingSigma
    ld a, $04 ; both Sigma keys use the same blue-primary PNG variant
    jr .writeSigma
.missingSigma
    ld a, $05
.writeSigma
    ld c, $06
    call GetBase
    call DrawIcon
    inc e
    ld a, e
    cp $0a
    jr nz, .sigma
    ret
GetBase:
    ld b, a
    add a
    add b
    ret
DrawIcon:
    push af
    push bc
    push de
    push hl
    ld b, a
    push hl
    ld d, $00
    sla e
    ld hl, STRIP
    add hl, de
    ld d, h
    ld e, l
    pop hl
    push de
    ld d, $00
    ld e, b
    add hl, de
    pop de
    ld b, $03
.row
    ld a, [hl+]
    ld [de], a
    inc de
    inc a
    ld [de], a
    ldh a, [$ff91]
    and a
    jr z, .nextRow
    ld a, $01
    ldh [$ff4f], a
    ld a, c
    cp $06
    jr z, .attributeReady
    ld a, b
    cp $02
    ld a, c
    jr z, .attributeReady
    ld a, $07 ; native black/white/blue palette, unchanged
.attributeReady
    ld [de], a
    dec de
    ld [de], a
    inc de
    xor a
    ldh [$ff4f], a
.nextRow
    ld a, e
    add $1f
    ld e, a
    jr nc, .noCarry
    inc d
.noCarry
    dec b
    jr nz, .row
    pop hl
    pop de
    pop bc
    pop af
    ret
BossAttributes:
    db 1,1,2,2,4,4,5,5
 ; LCD is disabled for both helpers. The original full attribute backup
; already preserves the sixteen BG cells. Inventory/palettes are untouched.
HideSubtanks:
    ld d, h
    ld e, l
    ld hl, SubtankCells
    ld b, 16
.cell
    ld a, [hl+]
    ld c, a
    ld a, [hl+]
    push hl
    ld h, a
    ld l, c
    ld a, [hl]
    ld [de], a
    inc de
    xor a
    ld [hl], a
    ldh a, [$ff91]
    and a
    jr z, .nextCell
    ld a, 1
    ldh [$ff4f], a
    xor a
    ld [hl], a
    ldh [$ff4f], a
.nextCell
    pop hl
    dec b
    jr nz, .cell
    ; Save at most four matching energy-fill objects. Inactive slots are FF.
    push de
    ld h, d
    ld l, e
    ld b, 8
    ld a, $ff
.empty
    ld [hl+], a
    dec b
    jr nz, .empty
    pop de
    ld hl, $ce00
    ld b, 4
    ld c, 0
.slot
    ld a, [hl]
    cp $30
    jr z, .position
    cp $48
    jr nz, .nextSlot
.position
    push hl
    inc l
    ld a, [hl+]
    cp $74
    jr z, .tile
    cp $8c
    jr nz, .noMatch
.tile
    ld a, [hl]
    cp $b0
    jr c, .noMatch
    cp $bd
    jr nc, .noMatch
    pop hl
    ld a, c
    ld [de], a
    inc de
    ld a, [hl]
    ld [de], a
    inc de
    xor a
    ld [hl], a
    ld h, $fe
    ld [hl], a
    ld h, $ce
    dec b
    ret z
    jr .nextSlot
.noMatch
    pop hl
.nextSlot
    ld a, l
    add 4
    ld l, a
    ld c, a
    cp $a0
    jr nz, .slot
    ret
RestoreSubtanks:
    ld d, h
    ld e, l
    ld hl, SubtankCells
    ld b, 16
.cell
    ld a, [hl+]
    ld c, a
    ld a, [hl+]
    push hl
    ld h, a
    ld l, c
    ld a, [de]
    inc de
    ld [hl], a
    pop hl
    dec b
    jr nz, .cell
    ld h, d
    ld l, e
    ld b, 4
.object
    ld a, [hl+]
    cp $ff
    ret z
    ld e, a
    ld a, [hl+]
    ld d, $ce
    ld [de], a
    ld d, $fe
    ld [de], a
    dec b
    jr nz, .object
    ret
SubtankCells:
    dw $9c8d,$9c8e,$9cad,$9cae,$9c90,$9c91,$9cb0,$9cb1
    dw $9ced,$9cee,$9d0d,$9d0e,$9cf0,$9cf1,$9d10,$9d11
KeyBarEnd::
ASSERT KeyBarEnd < $4800
SECTION "Seed weapon accents", ROMX[$4800], BANK[$40]
WeaponColors::
    ds 48, 0
SECTION "User PNG tiles", ROMX[$4900], BANK[$40]
SpriteTiles::
    INCBIN "key-sprites.bin"
SECTION "Key menu version", ROMX[$7ff0], BANK[$40]
    db "MXTK", $10
SECTION "Key bar bank identity", ROMX[$7ffe], BANK[$40]
    db $40, $00

INCLUDE "reward-message.asm"

