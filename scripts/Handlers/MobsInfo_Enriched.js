/**
 * MobsInfo_Enriched - Living Resources database (FUSIONNÉ)
 * 
 * SOURCE: MobsInfo.js original + corrections terrain
 * Généré automatiquement le 2025-11-01T19:30:11.761Z
 * 
 * 🔧 CORRECTIONS TERRAIN (logs 2025-11-01):
 * - TypeID 421, 423, 425, 427: AJOUTÉS (absents original)
 * - TypeID 530: Rock T6 → Fiber T4 (CORRIGÉ)
 * - TypeID 531: Rock T7 → Fiber T5 (CORRIGÉ)
 * 
 * Total: 235 TypeIDs
 */

class MobsInfo_Enriched {
    constructor() {
        this.moblist = {};
        this.initEnrichedMobs();
    }

    initEnrichedMobs() {
        // ========================================
        // FIBER (LivingHarvestable)
        // ========================================
        // 38 TypeIDs

        this.addItem(472, 3, 0, "Fiber");
        this.addItem(586, 3, 0, "Fiber");
        this.addItem(610, 3, 0, "Fiber");
        this.addItem(634, 3, 0, "Fiber");
        this.addItem(530, 4, 0, "Fiber"); // 🔧 Was Rock T6 in original - actually Fiber T4
        this.addItem(553, 4, 0, "Fiber");
        this.addItem(558, 4, 0, "Fiber");
        this.addItem(563, 4, 0, "Fiber");
        this.addItem(587, 4, 0, "Fiber");
        this.addItem(611, 4, 0, "Fiber");
        this.addItem(635, 4, 0, "Fiber");
        this.addItem(473, 5, 0, "Fiber");
        this.addItem(531, 5, 0, "Fiber"); // 🔧 Was Rock T7 in original - actually Fiber T5
        this.addItem(554, 5, 0, "Fiber");
        this.addItem(559, 5, 0, "Fiber");
        this.addItem(564, 5, 0, "Fiber");
        this.addItem(588, 5, 0, "Fiber");
        this.addItem(612, 5, 0, "Fiber");
        this.addItem(636, 5, 0, "Fiber");
        this.addItem(555, 6, 0, "Fiber");
        this.addItem(560, 6, 0, "Fiber");
        this.addItem(565, 6, 0, "Fiber");
        this.addItem(589, 6, 0, "Fiber");
        this.addItem(613, 6, 0, "Fiber");
        this.addItem(637, 6, 0, "Fiber");
        this.addItem(474, 7, 0, "Fiber");
        this.addItem(556, 7, 0, "Fiber");
        this.addItem(561, 7, 0, "Fiber");
        this.addItem(566, 7, 0, "Fiber");
        this.addItem(590, 7, 0, "Fiber");
        this.addItem(614, 7, 0, "Fiber");
        this.addItem(638, 7, 0, "Fiber");
        this.addItem(557, 8, 0, "Fiber");
        this.addItem(562, 8, 0, "Fiber");
        this.addItem(567, 8, 0, "Fiber");
        this.addItem(591, 8, 0, "Fiber");
        this.addItem(615, 8, 0, "Fiber");
        this.addItem(639, 8, 0, "Fiber");

        // ========================================
        // HIDE (LivingSkinnable)
        // ========================================
        // 85 TypeIDs

        this.addItem(322, 1, 1, "Hide");
        this.addItem(330, 1, 1, "Hide");
        this.addItem(358, 1, 1, "Hide");
        this.addItem(375, 1, 1, "Hide");
        this.addItem(386, 1, 1, "Hide");
        this.addItem(421, 1, 1, "Hide"); // 🔧 Absent original - confirmé logs
        this.addItem(331, 2, 1, "Hide");
        this.addItem(359, 2, 1, "Hide");
        this.addItem(360, 2, 1, "Hide");
        this.addItem(376, 2, 1, "Hide");
        this.addItem(387, 2, 1, "Hide");
        this.addItem(323, 3, 1, "Hide");
        this.addItem(332, 3, 1, "Hide");
        this.addItem(361, 3, 1, "Hide");
        this.addItem(377, 3, 1, "Hide");
        this.addItem(388, 3, 1, "Hide");
        this.addItem(423, 3, 1, "Hide"); // 🔧 Absent original - confirmé logs
        this.addItem(475, 3, 1, "Hide");
        this.addItem(324, 4, 1, "Hide");
        this.addItem(333, 4, 1, "Hide");
        this.addItem(338, 4, 1, "Hide");
        this.addItem(362, 4, 1, "Hide");
        this.addItem(370, 4, 1, "Hide");
        this.addItem(378, 4, 1, "Hide");
        this.addItem(383, 4, 1, "Hide");
        this.addItem(389, 4, 1, "Hide");
        this.addItem(396, 4, 1, "Hide");
        this.addItem(425, 4, 1, "Hide"); // 🔧 Absent original - confirmé logs
        this.addItem(493, 4, 1, "Hide");
        this.addItem(498, 4, 1, "Hide");
        this.addItem(503, 4, 1, "Hide");
        this.addItem(325, 5, 1, "Hide");
        this.addItem(334, 5, 1, "Hide");
        this.addItem(339, 5, 1, "Hide");
        this.addItem(363, 5, 1, "Hide");
        this.addItem(371, 5, 1, "Hide");
        this.addItem(379, 5, 1, "Hide");
        this.addItem(384, 5, 1, "Hide");
        this.addItem(390, 5, 1, "Hide");
        this.addItem(397, 5, 1, "Hide");
        this.addItem(427, 5, 1, "Hide"); // 🔧 Absent original - confirmé logs
        this.addItem(476, 5, 1, "Hide");
        this.addItem(494, 5, 1, "Hide");
        this.addItem(499, 5, 1, "Hide");
        this.addItem(504, 5, 1, "Hide");
        this.addItem(326, 6, 1, "Hide");
        this.addItem(335, 6, 1, "Hide");
        this.addItem(340, 6, 1, "Hide");
        this.addItem(364, 6, 1, "Hide");
        this.addItem(365, 6, 1, "Hide");
        this.addItem(372, 6, 1, "Hide");
        this.addItem(380, 6, 1, "Hide");
        this.addItem(385, 6, 1, "Hide");
        this.addItem(391, 6, 1, "Hide");
        this.addItem(398, 6, 1, "Hide");
        this.addItem(495, 6, 1, "Hide");
        this.addItem(500, 6, 1, "Hide");
        this.addItem(505, 6, 1, "Hide");
        this.addItem(327, 7, 1, "Hide");
        this.addItem(336, 7, 1, "Hide");
        this.addItem(341, 7, 1, "Hide");
        this.addItem(366, 7, 1, "Hide");
        this.addItem(367, 7, 1, "Hide");
        this.addItem(373, 7, 1, "Hide");
        this.addItem(381, 7, 1, "Hide");
        this.addItem(392, 7, 1, "Hide");
        this.addItem(393, 7, 1, "Hide");
        this.addItem(399, 7, 1, "Hide");
        this.addItem(477, 7, 1, "Hide");
        this.addItem(496, 7, 1, "Hide");
        this.addItem(501, 7, 1, "Hide");
        this.addItem(506, 7, 1, "Hide");
        this.addItem(328, 8, 1, "Hide");
        this.addItem(337, 8, 1, "Hide");
        this.addItem(342, 8, 1, "Hide");
        this.addItem(368, 8, 1, "Hide");
        this.addItem(369, 8, 1, "Hide");
        this.addItem(374, 8, 1, "Hide");
        this.addItem(382, 8, 1, "Hide");
        this.addItem(394, 8, 1, "Hide");
        this.addItem(395, 8, 1, "Hide");
        this.addItem(400, 8, 1, "Hide");
        this.addItem(497, 8, 1, "Hide");
        this.addItem(502, 8, 1, "Hide");
        this.addItem(507, 8, 1, "Hide");

        // ========================================
        // WOOD (LivingHarvestable)
        // ========================================
        // 38 TypeIDs

        this.addItem(483, 3, 0, "Wood");
        this.addItem(484, 3, 0, "Wood");
        this.addItem(568, 3, 0, "Wood");
        this.addItem(592, 3, 0, "Wood");
        this.addItem(616, 3, 0, "Wood");
        this.addItem(508, 4, 0, "Wood");
        this.addItem(513, 4, 0, "Wood");
        this.addItem(518, 4, 0, "Wood");
        this.addItem(569, 4, 0, "Wood");
        this.addItem(593, 4, 0, "Wood");
        this.addItem(617, 4, 0, "Wood");
        this.addItem(485, 5, 0, "Wood");
        this.addItem(486, 5, 0, "Wood");
        this.addItem(509, 5, 0, "Wood");
        this.addItem(514, 5, 0, "Wood");
        this.addItem(519, 5, 0, "Wood");
        this.addItem(570, 5, 0, "Wood");
        this.addItem(594, 5, 0, "Wood");
        this.addItem(618, 5, 0, "Wood");
        this.addItem(510, 6, 0, "Wood");
        this.addItem(515, 6, 0, "Wood");
        this.addItem(520, 6, 0, "Wood");
        this.addItem(571, 6, 0, "Wood");
        this.addItem(595, 6, 0, "Wood");
        this.addItem(619, 6, 0, "Wood");
        this.addItem(487, 7, 0, "Wood");
        this.addItem(511, 7, 0, "Wood");
        this.addItem(516, 7, 0, "Wood");
        this.addItem(521, 7, 0, "Wood");
        this.addItem(572, 7, 0, "Wood");
        this.addItem(596, 7, 0, "Wood");
        this.addItem(620, 7, 0, "Wood");
        this.addItem(512, 8, 0, "Wood");
        this.addItem(517, 8, 0, "Wood");
        this.addItem(522, 8, 0, "Wood");
        this.addItem(573, 8, 0, "Wood");
        this.addItem(597, 8, 0, "Wood");
        this.addItem(621, 8, 0, "Wood");

        // ========================================
        // ORE (LivingHarvestable)
        // ========================================
        // 38 TypeIDs

        this.addItem(478, 3, 0, "Ore");
        this.addItem(479, 3, 0, "Ore");
        this.addItem(580, 3, 0, "Ore");
        this.addItem(604, 3, 0, "Ore");
        this.addItem(628, 3, 0, "Ore");
        this.addItem(538, 4, 0, "Ore");
        this.addItem(543, 4, 0, "Ore");
        this.addItem(548, 4, 0, "Ore");
        this.addItem(581, 4, 0, "Ore");
        this.addItem(605, 4, 0, "Ore");
        this.addItem(629, 4, 0, "Ore");
        this.addItem(480, 5, 0, "Ore");
        this.addItem(481, 5, 0, "Ore");
        this.addItem(539, 5, 0, "Ore");
        this.addItem(544, 5, 0, "Ore");
        this.addItem(549, 5, 0, "Ore");
        this.addItem(582, 5, 0, "Ore");
        this.addItem(606, 5, 0, "Ore");
        this.addItem(630, 5, 0, "Ore");
        this.addItem(540, 6, 0, "Ore");
        this.addItem(545, 6, 0, "Ore");
        this.addItem(550, 6, 0, "Ore");
        this.addItem(583, 6, 0, "Ore");
        this.addItem(607, 6, 0, "Ore");
        this.addItem(631, 6, 0, "Ore");
        this.addItem(482, 7, 0, "Ore");
        this.addItem(541, 7, 0, "Ore");
        this.addItem(546, 7, 0, "Ore");
        this.addItem(551, 7, 0, "Ore");
        this.addItem(584, 7, 0, "Ore");
        this.addItem(608, 7, 0, "Ore");
        this.addItem(632, 7, 0, "Ore");
        this.addItem(542, 8, 0, "Ore");
        this.addItem(547, 8, 0, "Ore");
        this.addItem(552, 8, 0, "Ore");
        this.addItem(585, 8, 0, "Ore");
        this.addItem(609, 8, 0, "Ore");
        this.addItem(633, 8, 0, "Ore");

        // ========================================
        // ROCK (LivingHarvestable)
        // ========================================
        // 36 TypeIDs

        this.addItem(488, 3, 0, "Rock");
        this.addItem(489, 3, 0, "Rock");
        this.addItem(574, 3, 0, "Rock");
        this.addItem(598, 3, 0, "Rock");
        this.addItem(622, 3, 0, "Rock");
        this.addItem(523, 4, 0, "Rock");
        this.addItem(528, 4, 0, "Rock");
        this.addItem(533, 4, 0, "Rock");
        this.addItem(575, 4, 0, "Rock");
        this.addItem(599, 4, 0, "Rock");
        this.addItem(623, 4, 0, "Rock");
        this.addItem(490, 5, 0, "Rock");
        this.addItem(491, 5, 0, "Rock");
        this.addItem(524, 5, 0, "Rock");
        this.addItem(529, 5, 0, "Rock");
        this.addItem(534, 5, 0, "Rock");
        this.addItem(576, 5, 0, "Rock");
        this.addItem(600, 5, 0, "Rock");
        this.addItem(624, 5, 0, "Rock");
        this.addItem(525, 6, 0, "Rock");
        this.addItem(535, 6, 0, "Rock");
        this.addItem(577, 6, 0, "Rock");
        this.addItem(601, 6, 0, "Rock");
        this.addItem(625, 6, 0, "Rock");
        this.addItem(492, 7, 0, "Rock");
        this.addItem(526, 7, 0, "Rock");
        this.addItem(536, 7, 0, "Rock");
        this.addItem(578, 7, 0, "Rock");
        this.addItem(602, 7, 0, "Rock");
        this.addItem(626, 7, 0, "Rock");
        this.addItem(527, 8, 0, "Rock");
        this.addItem(532, 8, 0, "Rock");
        this.addItem(537, 8, 0, "Rock");
        this.addItem(579, 8, 0, "Rock");
        this.addItem(603, 8, 0, "Rock");
        this.addItem(627, 8, 0, "Rock");

        console.log(`[MobsInfo_Enriched] ✅ Loaded ${Object.keys(this.moblist).length} living resource TypeIDs (fusionné)`);
    }

    addItem(id, tier, type, name) {
        if (!this.moblist[id]) {
            this.moblist[id] = [];
        }
        this.moblist[id][0] = tier;
        this.moblist[id][1] = type; // 0 = LivingHarvestable, 1 = LivingSkinnable
        this.moblist[id][2] = name;
    }
}

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MobsInfo_Enriched;
}
